export interface QuestionScores {
  q4: number; // max 2.0
  q5: number; // max 3.0
  q6: number; // max 5.0
}

export interface StudentScore {
  id: string;
  name: string;
  class: string;
  score: string; // e.g. "8.5/10" or "8.5"
  totalScore?: number; // e.g. 8.5
  questionScores?: QuestionScores;
  comment: string;
  testTitle?: string;
  date?: string;
}

export type ScoreRating = 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Chưa đạt';

export interface ParsedScore {
  scoreNum: number;
  maxNum: number;
  percentage: number;
  rating: ScoreRating;
  ratingColor: string;
  badgeBg: string;
  questionScores?: QuestionScores;
}
