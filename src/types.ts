export interface KanjiCard {
  id: string;
  kanji: string;
  reading: string;
  romaji?: string;
  sinoVietnamese?: string;
  kanjiExplanation?: string;
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

export type WordCategory = 'Danh từ' | 'Động từ nhóm I' | 'Động từ nhóm II' | 'Động từ nhóm III' | 'Tính từ đuôi-i' | 'Tính từ đuôi-na' | 'Ngữ pháp' | 'Khác';

export interface IntensiveExample {
  id: string;
  sentence: string;
  reading?: string;
  romaji?: string;
  translation: string;
  mastered?: boolean;
}

export interface IntensiveWord {
  id: string;
  word: string;
  reading: string;
  romaji?: string;
  category: WordCategory | string;
  explanation: string;
  examples: IntensiveExample[];
  createdAt: number;
  reviewScore?: number;
}

export type ReviewGrade = 'forgot' | 'hard' | 'good' | 'easy';

export type ViewState = 'dashboard' | 'review' | 'list' | 'add' | 'difficult_review' | 'intensive_vocab' | 'short_study' | 'sentence_review';
