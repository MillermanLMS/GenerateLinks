import { IMarkingFeedbackItem } from './MarkingFeedbackItem';
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

  // if I end up wanting to feed the formgroup directly
  // https://stackoverflow.com/questions/49997765/reactive-forms-correctly-convert-form-value-to-model-object
  // public constructor(init?: Partial<IMarkingFeedback>) {
  //   Object.assign(this, init);
  // }
  public constructor(mf: string) {
    Object.assign(this, JSON.parse(mf));
  }
  public isIMarkingFeedback(mf: IMarkingFeedback): mf is IMarkingFeedback {
    return (mf as IMarkingFeedback).markingFeedback !== undefined;
  }
}
