export interface Rubric {
  description: string;
  score: number;
}
export interface Feedback {
  feedback: string;
  deduction: number;
  applied?: boolean;
}
export interface MarkingFeedback {
  id?: number;
  rubric: Rubric;
  feedbackList: Feedback[];
  pointsAwarded?: number;
}
