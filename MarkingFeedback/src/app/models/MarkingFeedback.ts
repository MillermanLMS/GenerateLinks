import { MarkingFeedbackItem } from "./MarkingFeedbackItem";
import { TeacherNote } from "./TeacherNote";

export interface MarkingFeedback {
  markingFeedback: MarkingFeedbackItem[];
  cheated?: boolean;
  triedBonus?: boolean;
  teacherNotes?: TeacherNote[];
}
