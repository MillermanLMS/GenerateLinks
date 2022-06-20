export interface Rubric {
  description: string;
  score: number;
  type?: string;
}
export interface Feedback {
  feedback: string;
  // valueWorth: number; // change to this once you figure out migrating deductions over
  deduction: number;
  applied?: boolean;
}
export interface MarkingFeedbackItem {
  rubric: Rubric;
  feedbackList: Feedback[];
  id?: number;
  pointsAwarded?: number;
  bonus?: boolean;
  scoring: ScoringOperation;
  scoringType?: string;
}

export type ScoringType =
  | ScoringTypeValue.Subtraction
  | ScoringTypeValue.Addition;

export enum ScoringTypeValue {
  Subtraction = 'subtraction',
  Addition = 'addition',
}
export class ScoringOperation {
  operation: ScoringType = ScoringTypeValue.Subtraction;
  constructor(scoringType?: string) {
    this.operation =
      (scoringType as ScoringType) || ScoringTypeValue.Subtraction;
  }
  // maybe overload operand one day: https://extendscript.docsforadobe.dev/extendscript-tools-features/operator-overloading.html#:~:text=ExtendScript%20allows%20you%20to%20extend,operator%20for%20the%20class%20MyClass%20.
  operate(calculatedMarks: number, rubricScore: number): number {
    switch (this.operation) {
      case ScoringTypeValue.Addition:
        return Math.min(calculatedMarks, rubricScore);
      case ScoringTypeValue.Subtraction:
        return Math.max(rubricScore - calculatedMarks, 0);
      default:
        return -1;
    }
  }
  defaultRubricScore(rubricScore: number): number {
    switch (this.operation) {
      case ScoringTypeValue.Addition:
        return 0;
      case ScoringTypeValue.Subtraction:
        return rubricScore;
      default:
        return -1;
    }
  }
  toString(): string {
    switch (this.operation) {
      case ScoringTypeValue.Subtraction:
      case ScoringTypeValue.Addition:
      default:
        return '';
    }
  }
}

export interface TeacherNote {
  type: string;
  content: string;
}
export interface MarkingFeedback {
  markingFeedback: MarkingFeedbackItem[];
  cheated?: boolean;
  triedBonus?: boolean;
  teacherNotes?: TeacherNote[];
}
