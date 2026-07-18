const fs = require('fs');
let file = fs.readFileSync('src/types.ts', 'utf8');

const oldLogic = `export interface DialogueSentence {
  id: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  vietnamese: string;
  explanation?: string;
}`;

const newLogic = `export interface DialogueSentence {
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
}`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('src/types.ts', file);
console.log('Patched types');
