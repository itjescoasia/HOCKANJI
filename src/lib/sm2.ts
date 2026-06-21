import { KanjiCard, ReviewGrade } from '../types';

export function calculateNextReview(card: KanjiCard, grade: ReviewGrade): KanjiCard {
  let { repetition, interval, easeFactor } = card;

  let sm2Quality = 0;
  // Based on SM-2 algorithm heuristics
  if (grade === 'forgot') sm2Quality = 1; // Incorrect, but remembered correct one
  if (grade === 'hard') sm2Quality = 3;   // Correct, but serious difficulty
  if (grade === 'good') sm2Quality = 4;   // Correct, after hesitation
  if (grade === 'easy') sm2Quality = 5;   // Perfect response

  if (sm2Quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition++;
  } else {
    repetition = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - sm2Quality) * (0.08 + (5 - sm2Quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    ...card,
    interval,
    repetition,
    easeFactor,
    nextReviewDate: nextReviewDate.getTime()
  };
}
