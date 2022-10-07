import { IMarkingFeedbackItem } from "./MarkingFeedbackItem";
import { ITeacherNote } from "./TeacherNote";

export interface IMarkingFeedback {
  markingFeedback: IMarkingFeedbackItem[];
  cheated?: boolean;
  triedBonus?: boolean;
  teacherNotes?: ITeacherNote[];
}
