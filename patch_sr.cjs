const fs = require('fs');
const file = 'src/components/SentenceReview.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`  mode: "JA_TO_VI" | "VI_TO_JA";
  onClose: () => void;`,
`  mode: "JA_TO_VI" | "VI_TO_JA";
  forceAll?: boolean;
  onClose: () => void;`
);

content = content.replace(
`export const SentenceReview: React.FC<SentenceReviewProps> = ({
  deck,
  mainDeck,
  mode,
  onClose,
  onUpdateWord,
  onRecordReview,
}) => {`,
`export const SentenceReview: React.FC<SentenceReviewProps> = ({
  deck,
  mainDeck,
  mode,
  forceAll,
  onClose,
  onUpdateWord,
  onRecordReview,
}) => {`
);

content = content.replace(
`    const dueExamples = allExamples.filter((ex) => {
      const isMastered =
        mode === "VI_TO_JA"
          ? (ex.viToJaMastered ?? ex.mastered)
          : (ex.jaToViMastered ?? ex.mastered);
      if (!isMastered) return true; // always show unmastered (Chưa nhớ)

      const nextReviewDate =
        mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
      if (!nextReviewDate) return true; // show if mastered but no review date set

      return nextReviewDate <= now;
    });`,
`    const dueExamples = forceAll ? allExamples : allExamples.filter((ex) => {
      const isMastered =
        mode === "VI_TO_JA"
          ? (ex.viToJaMastered ?? ex.mastered)
          : (ex.jaToViMastered ?? ex.mastered);
      if (!isMastered) return true; // always show unmastered (Chưa nhớ)

      const nextReviewDate =
        mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
      if (!nextReviewDate) return true; // show if mastered but no review date set

      return nextReviewDate <= now;
    });`
);

content = content.replace(
`          const isMastered = mode === "VI_TO_JA" ? (ex.viToJaMastered ?? ex.mastered) : (ex.jaToViMastered ?? ex.mastered);
          if (isMastered) {
             const nextReview = mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
             if (nextReview && nextReview > now) {
                return false; // already reviewed and not due
             }
          }`,
`          const isMastered = mode === "VI_TO_JA" ? (ex.viToJaMastered ?? ex.mastered) : (ex.jaToViMastered ?? ex.mastered);
          if (!forceAll && isMastered) {
             const nextReview = mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
             if (nextReview && nextReview > now) {
                return false; // already reviewed and not due
             }
          }`
);

fs.writeFileSync(file, content);
console.log('Patched SentenceReview.tsx');
