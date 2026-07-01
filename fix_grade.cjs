const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf-8');

const target = `  const handleGrade = (mastered: boolean) => {
    if (onUpdateWord) {
      const word = deck.find((w) => w.id === currentExample.wordId);
      if (word) {
        const updatedExamples = word.examples.map((ex) => {
          if (ex.id === currentExample.id) {
            // Calculate Spaced Repetition values
            const currentInterval =
              mode === "VI_TO_JA" ? ex.viToJaInterval : ex.jaToViInterval;

            let nextInterval = 0;
            let nextReviewDate = Date.now(); // default to now if not mastered

            if (mastered) {
              // Simple SM-2 style intervals
              nextInterval =
                !currentInterval || currentInterval === 0
                  ? 1
                  : currentInterval === 1
                    ? 3
                    : currentInterval === 3
                      ? 7
                      : currentInterval * 2;

              nextReviewDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
            }

            return mode === "VI_TO_JA"
              ? {
                  ...ex,
                  viToJaMastered: mastered,
                  viToJaInterval: nextInterval,
                  viToJaNextReviewDate: nextReviewDate,
                }
              : {
                  ...ex,
                  jaToViMastered: mastered,
                  jaToViInterval: nextInterval,
                  jaToViNextReviewDate: nextReviewDate,
                };
          }
          return ex;
        });`;

const replacement = `  const handleGrade = (grade: 'forgot' | 'hard' | 'good') => {
    if (onUpdateWord) {
      const word = deck.find((w) => w.id === currentExample.wordId);
      if (word) {
        const updatedExamples = word.examples.map((ex) => {
          if (ex.id === currentExample.id) {
            // Calculate Spaced Repetition values
            const currentInterval = mode === "VI_TO_JA" ? ex.viToJaInterval : ex.jaToViInterval;
            const currentFailCount = mode === "VI_TO_JA" ? (ex.viToJaFailCount || 0) : (ex.jaToViFailCount || 0);

            let nextInterval = 0;
            let nextReviewDate = Date.now();
            let newFailCount = currentFailCount;
            let isMastered = false;

            if (grade === 'good') {
              nextInterval = (!currentInterval || currentInterval === 0) ? 1 : 
                             (currentInterval === 1 ? 3 : 
                             (currentInterval === 3 ? 7 : currentInterval * 2));
              isMastered = true;
            } else if (grade === 'hard') {
              nextInterval = 1; // Học lại vào ngày mai
              newFailCount += 1; // Tăng bộ đếm số lần quên
              isMastered = false;
            } else if (grade === 'forgot') {
              nextInterval = 0; // Học lại ngay
              isMastered = false;
            }

            if (nextInterval > 0) {
              nextReviewDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
            }

            return mode === "VI_TO_JA"
              ? {
                  ...ex,
                  viToJaMastered: isMastered,
                  viToJaInterval: nextInterval,
                  viToJaNextReviewDate: nextReviewDate,
                  viToJaFailCount: newFailCount
                }
              : {
                  ...ex,
                  jaToViMastered: isMastered,
                  jaToViInterval: nextInterval,
                  jaToViNextReviewDate: nextReviewDate,
                  jaToViFailCount: newFailCount
                };
          }
          return ex;
        });`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/SentenceReview.tsx', code, 'utf-8');
    console.log("Replaced logic");
} else {
    console.log("Could not find target logic");
}
