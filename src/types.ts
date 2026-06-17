export interface KanjiCard {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReviewDate: number; 
  createdAt: number;
}

export type ReviewGrade = 'forgot' | 'hard' | 'good' | 'easy';

export type ViewState = 'dashboard' | 'review' | 'list' | 'add';
