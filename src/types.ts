export interface KanjiExample {
  id: string;
  sentence: string;
  reading?: string;
  romaji?: string;
  translation: string;
  audioUrl?: string | null;
  hasAudio?: boolean;
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
  audioUrl?: string | null;
  hasAudio?: boolean;
  examples?: KanjiExample[];
  forms?: { id: string; name: string; value: string; reading?: string; romaji?: string; meaning?: string; }[];
  wordType?: string;
  freeStudyScore?: number;
  difficultScore?: number;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReviewDate: number; 
  createdAt: number;
}

export type WordCategory = 'Danh từ' | 'Động từ nhóm I' | 'Động từ nhóm II' | 'Động từ nhóm III' | 'Tính từ đuôi-i' | 'Tính từ đuôi-na' | 'Ngữ pháp' | 'Trạng từ (副詞)' | 'Khác';

export interface IntensiveExample {
  id: string;
  sentence: string;
  reading?: string;
  romaji?: string;
  translation: string;
  audioUrl?: string | null;
  hasAudio?: boolean;
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
  jaToViRepetition?: number;
  viToJaRepetition?: number;
  jaToViEaseFactor?: number;
  viToJaEaseFactor?: number;
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
  order?: number;
  hasAudio?: boolean;
  audioUrl?: string | null;
}

export type ReviewGrade = 'forgot' | 'hard' | 'good' | 'easy';

export interface DialogueSentence {
  hasAudio?: boolean;
  audioUrl?: string | null;
  id: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  vietnamese: string;
  explanation?: string;
  jaToViMastered?: boolean;
  viToJaMastered?: boolean;
  jaToViNextReviewDate?: number;
  viToJaNextReviewDate?: number;
  jaToViInterval?: number;
  viToJaInterval?: number;
  jaToViFailCount?: number;
  viToJaFailCount?: number;
  jaToViRepetition?: number;
  viToJaRepetition?: number;
  jaToViEaseFactor?: number;
  viToJaEaseFactor?: number;
}

export interface Conversation {
  id: string;
  title: string;
  description: string;
  dialogues: DialogueSentence[];
  createdAt: number;
  vocabScores?: Record<string, number>;
  order?: number;
  hasAudio?: boolean;
  audioUrl?: string | null;
}

export type ViewState = 'dashboard' | 'review' | 'list' | 'add' | 'difficult_review' | 'intensive_vocab' | 'short_study' | 'sentence_review' | 'conversation';
