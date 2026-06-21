export interface KanjiCard {
  id: string;
  kanji: string;
  reading: string;
  sinoVietnamese?: string;
  meaning: string;
  example?: string;
  exampleTranslation?: string;
  wordType?: string;
  freeStudyScore?: number;
  difficultScore?: number;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReviewDate: number; 
  createdAt: number;
}

export type ReviewGrade = 'forgot' | 'hard' | 'good' | 'easy';

export type ViewState = 'dashboard' | 'review' | 'list' | 'add' | 'difficult_review';
