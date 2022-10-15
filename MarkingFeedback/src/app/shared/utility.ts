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
): MarkingFeedback | undefined {
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
    return new MarkingFeedback(markingFeedback);
  }
  return;
}
