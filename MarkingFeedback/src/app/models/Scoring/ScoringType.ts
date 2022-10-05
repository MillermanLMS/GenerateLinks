import { ScoringTypeValue } from "../enums/ScoringTypeValue";

export type ScoringType =
  | ScoringTypeValue.Subtraction
  | ScoringTypeValue.Addition;
