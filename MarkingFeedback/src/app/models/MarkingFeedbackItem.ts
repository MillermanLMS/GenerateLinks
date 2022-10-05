import { Feedback } from "./Feedback";
import { Rubric } from "./Rubric";
import { ScoringOperation } from "./Scoring/ScoringOperation";

export interface MarkingFeedbackItem {
  rubric: Rubric;
  feedbackList: Feedback[];
  id?: number;
  pointsAwarded?: number;
  bonus?: boolean;
  scoring: ScoringOperation;
  scoringType?: string;
}
