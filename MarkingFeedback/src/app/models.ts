export interface Rubric {
  description: string;
  score: number;
}
export interface Feedback {
  text: string;
  deduction: number;
  element: HTMLDivElement;
}
export interface MarkingFeedback {
  rubric: Rubric;
  feedback: Feedback[];
}
