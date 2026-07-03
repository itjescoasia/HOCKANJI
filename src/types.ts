export interface KanjiExample {
  id: string;
  sentence: string;
  reading?: string;
  romaji?: string;
  translation: string;
}

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
  examples?: KanjiExample[];
  forms?: { id: string; name: string; value: string; }[];
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
  specialNote?: string;
  mastered?: boolean; // legacy
  jaToViMastered?: boolean;
  viToJaMastered?: boolean;
  jaToViNextReviewDate?: number;
  viToJaNextReviewDate?: number;
  jaToViInterval?: number;
  viToJaInterval?: number;
  jaToViFailCount?: number;
  viToJaFailCount?: number;
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

export interface DialogueSentence {
  id: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  vietnamese: string;
  explanation?: string;
}

export interface Conversation {
  id: string;
  title: string;
  description: string;
  dialogues: DialogueSentence[];
  createdAt: number;
  vocabScores?: Record<string, number>;
}

export type ViewState = 'dashboard' | 'review' | 'list' | 'add' | 'difficult_review' | 'intensive_vocab' | 'short_study' | 'sentence_review' | 'conversation';
