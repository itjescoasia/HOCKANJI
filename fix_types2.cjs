const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const t = `export interface IntensiveExample {
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
  audioUrl?: string | null;
  hasAudio?: boolean;`;

const r = `export interface IntensiveExample {
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
  viToJaNextReviewDate?: number;`;

code = code.replace(t, r);
fs.writeFileSync('src/types.ts', code);
