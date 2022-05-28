export interface Rubric {
  description: string;
  score: number;
  type?: string;
}
export interface Feedback {
  feedback: string;
  deduction: number;
  applied?: boolean;
}
export interface MarkingFeedbackItem {
  id?: number;
  rubric: Rubric;
  feedbackList: Feedback[];
  pointsAwarded?: number;
  bonus?: boolean;
}
export interface MarkingFeedback {
  markingFeedback: MarkingFeedbackItem[];
  cheated?: boolean;
}
