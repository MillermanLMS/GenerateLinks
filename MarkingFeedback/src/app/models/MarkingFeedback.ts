import { ScoringTypeValue } from './enums/ScoringTypeValue';
import { Feedback } from './Feedback';
import { IMarkingFeedbackItem } from './MarkingFeedbackItem';
import { ScoringOperation } from './Scoring/ScoringOperation';
import { ITeacherNote } from './TeacherNote';

export interface IMarkingFeedback {
  markingFeedback: IMarkingFeedbackItem[];
  cheated?: boolean;
  triedBonus?: boolean;
  teacherNotes?: ITeacherNote[];
}

export class MarkingFeedback implements IMarkingFeedback {
  markingFeedback: IMarkingFeedbackItem[] = [];
  cheated?: boolean;
  triedBonus?: boolean;
  teacherNotes?: ITeacherNote[];
  total: number = 0;
  classRubricFileName?: string;

  // if I end up wanting to feed the formgroup directly
  // https://stackoverflow.com/questions/49997765/reactive-forms-correctly-convert-form-value-to-model-object
  public constructor(init?: Partial<IMarkingFeedback>, mf?: string) {
    if (init) Object.assign(this, init);
    else if (mf) Object.assign(this, JSON.parse(mf));
    this.setDefaults();

    // TODO: make the total smart and work based on if the values subtract or add
    //hard coding subtraction for now
    this.updateTotal();
  }
  public isIMarkingFeedback(mf: IMarkingFeedback): mf is IMarkingFeedback {
    return (mf as IMarkingFeedback).markingFeedback !== undefined;
  }

  private setDefaults() {
    this.markingFeedback.map((mf, index) => {
      mf.scoring = new ScoringOperation(mf.scoringType);
      let defaultValues = {
        pointsAwarded:
          mf.scoring.operation == ScoringTypeValue.Subtraction
            ? mf.rubric.score
            : 0,
        id: index,
        bonus: false,
      };
      mf = {
        ...defaultValues,
        ...mf,
      };
    });
  }
  private cleanMarkingFeedback(): MarkingFeedback {
    this.markingFeedback.map((mf) => {
      return {
        ...mf,
        pointsAwarded: mf.scoring.defaultRubricScore(mf.rubric.score), // reset score
        feedbackList: mf.feedbackList.map((f) => {
          // uncheck feedbacks
          return {
            feedback: f.feedback,
            deduction: f.deduction,
            applied: false,
          };
        }),
      };
    });
    return this;
  }

  public createLocalStorageMarkingFeedback(
    className: string,
    evaluationName: string
  ): boolean {
    // let fileLocation = `assets/${this.classRubricFileName}.json`;
    // this.http.get(fileLocation).subscribe((rubric) => {
    //   this.snack.open('Loaded from file: ' + fileLocation, 'Dismiss');
    this.classRubricFileName = `${className}${evaluationName}`;
    // this.initTable({
    //   markingFeedback: markingFeedback as MarkingFeedbackItem[],
    //   teacherNotes: (rubric as any)['teacherNotes'] as TeacherNote[],
    // });
    // });
    localStorage.setItem(
      this.classRubricFileName,
      JSON.stringify(this.cleanMarkingFeedback())
    );

    return true;
  }
  saveCleanMarkingFeedbackToLocalStorage(classRubricFileName?: string): void {
    this.classRubricFileName ??= classRubricFileName;
    localStorage.setItem(
      this.classRubricFileName ?? 'ERROR',
      JSON.stringify(this.cleanMarkingFeedback())
    );
  }
  toggleBonus(triedBonus?: boolean) {
    this.triedBonus = triedBonus;
  }
  toggleAI(AI?: boolean) {
    this.cheated = AI;
  }
  updatePointsAwarded(id: number) {
    this.markingFeedback[id].pointsAwarded = this.calculateRubricItemScore(id);
    this.updateTotal();
  }

  updateFeedback(id: number, feedbackItem: Feedback) {
    this.markingFeedback[id].feedbackList.push(feedbackItem);
  }
  updateTotal(total?: number) {
    this.total =
      total ||
      this.markingFeedback
        .map((mf) =>
          !mf.bonus || (mf.bonus && this.triedBonus) ? mf.pointsAwarded || 0 : 0
        )
        .reduce((v, a) => v + a, 0);
  }
  calculateRubricItemScore(id: number): number {
    return this.markingFeedback[id].scoring.operate(
      this.markingFeedback[id].feedbackList
        .map((f) => {
          return f.applied ? f.deduction : 0;
        })
        .reduce((partialSum, a) => partialSum + a, 0),
      this.markingFeedback[id].rubric.score
    );
  }
  removeFeedback(row: any, index: number): void {
    // event.stopPropogation();
    console.log('remove');
    this.markingFeedback[row.id].feedbackList.splice(index, 1);
    this.markingFeedback[row.id].pointsAwarded = this.calculateRubricItemScore(
      row.id
    );
    this.updateTotal();
    this.saveCleanMarkingFeedbackToLocalStorage();
  }
}
