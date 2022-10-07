import { Feedback } from "./Feedback";
import { IRubric } from "./Rubric";
import { ScoringOperation } from "./Scoring/ScoringOperation";

export interface IMarkingFeedbackItem {
  rubric: IRubric;
  feedbackList: Feedback[];
  id?: number;
  pointsAwarded?: number;
  bonus?: boolean;
  scoring: ScoringOperation;
  scoringType?: string;
}
