export interface Feedback {
  order?: number;
  feedback: string;
  // valueWorth: number; // change to this once you figure out migrating deductions over
  deduction: number;
  applied?: boolean;
}
