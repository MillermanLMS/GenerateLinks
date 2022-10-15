import { ScoringTypeValue } from '../models/enums/ScoringTypeValue';
import { IMarkingFeedback, MarkingFeedback } from '../models/MarkingFeedback';
import { IMarkingFeedbackItem } from '../models/MarkingFeedbackItem';
import { ScoringOperation } from '../models/Scoring/ScoringOperation';
import { ITeacherNote } from '../models/TeacherNote';

// TODO: change over to using ngx-indexed-db instead of localstorage for student feedbacks
// https://github.com/assuncaocharles/ngx-indexed-db

// TODO: Deep clone object, for the tablevalues$

/**
 *
 * @param classRubricFileName
 * @param studentRubricFileName
 * @returns
 */
export function init(
  classRubricFileName: string,
  studentRubricFileName: string = ''
): any {
  let markingFeedback: IMarkingFeedback;
  let studentMarkingFeedback: IMarkingFeedback;

  if (classRubricFileName && localStorage.hasOwnProperty(classRubricFileName)) {
    // load the class rubric file
    markingFeedback = JSON.parse(
      localStorage.getItem(classRubricFileName) || '{}'
    ) as IMarkingFeedback;

    // load student rubric feedback if it exists
    if (
      studentRubricFileName &&
      localStorage.hasOwnProperty(studentRubricFileName)
    ) {
      studentMarkingFeedback = JSON.parse(
        localStorage.getItem(studentRubricFileName) || '{"markingFeedback":[]}'
      ) as IMarkingFeedback;
      markingFeedback.cheated = studentMarkingFeedback.cheated;
      markingFeedback.triedBonus = studentMarkingFeedback.triedBonus;
    }
    if (markingFeedback['markingFeedback']) {
      markingFeedback.markingFeedback.forEach((mf, index) => {
        mf.scoring = new ScoringOperation(mf['scoringType']);
        if (studentMarkingFeedback?.markingFeedback[index]) {
          mf.feedbackList = [
            // using Set removes duplicate items when merging the two arrays
            ...new Set([
              ...mf.feedbackList.map((fl) => {
                return {
                  order: fl.order ?? -1,
                  feedback: fl.feedback,
                  deduction: fl.deduction,
                  applied: !!fl.applied,
                };
              }),
              ...studentMarkingFeedback.markingFeedback[index].feedbackList.map(
                (fl) => {
                  return {
                    order: fl.order ?? -1,
                    feedback: fl.feedback,
                    deduction: fl.deduction,
                    applied: !!fl.applied,
                  };
                }
              ),
            ]),
          ].sort((a, b) => a.order - b.order);
          // mf.scoring = new ScoringOperation(
          //   mf.scoringType ||
          //   studentMarkingFeedback.markingFeedback[index].scoringType
          // );
          mf.pointsAwarded =
            studentMarkingFeedback.markingFeedback[index].pointsAwarded;
        }
      });
    }
    return markingFeedback;
  }
  return;
}
/**
 * didn't get it from local storage
 * @param className
 * @param evaluationName
 * @param rubric
 * @returns
 */
export function createLocalStorageMarkingFeedback(
  className: string,
  evaluationName: string,
  markingFeedback: MarkingFeedback
): boolean {
  // let fileLocation = `assets/${this.classRubricFileName}.json`;
  // this.http.get(fileLocation).subscribe((rubric) => {
  //   this.snack.open('Loaded from file: ' + fileLocation, 'Dismiss');
  let classRubricFileName = `${className}${evaluationName}`;
  markingFeedback.markingFeedback.map((mf, index) => {
    mf.scoring = new ScoringOperation(mf.scoringType);
    let defaultValues = {
      pointsAwarded:
        mf.scoring.operation == ScoringTypeValue.Subtraction
          ? mf.rubric.score
          : 0,
      id: index,
      bonus: false,
    };
    return {
      ...defaultValues,
      ...mf,
    };
  });
  // this.initTable({
  //   markingFeedback: markingFeedback as MarkingFeedbackItem[],
  //   teacherNotes: (rubric as any)['teacherNotes'] as TeacherNote[],
  // });
  // });
  localStorage.setItem(
    classRubricFileName,
    JSON.stringify(cleanMarkingFeedback(markingFeedback))
  );

  return true;
}

/**
 *
 * @param classRubricFileName
 * @param markingFeedback
 */
export function saveCleanMarkingFeedbackToLocalStorage(
  classRubricFileName: string,
  markingFeedback: IMarkingFeedback
): void {
  localStorage.setItem(
    classRubricFileName,
    JSON.stringify(cleanMarkingFeedback(markingFeedback))
  );
}

/**
 *
 * @param markingFeedback
 * @returns
 */
export function cleanMarkingFeedback(
  markingFeedback: IMarkingFeedback
): IMarkingFeedback {
  return {
    teacherNotes: markingFeedback.teacherNotes,
    markingFeedback: markingFeedback.markingFeedback.map((mf) => {
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
    }) as IMarkingFeedbackItem[],
  } as IMarkingFeedback;
}
