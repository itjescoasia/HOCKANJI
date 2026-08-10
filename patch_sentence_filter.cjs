const fs = require('fs');
let content = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const oldFilter = `    const dueExamples = forceAll ? allExamples : allExamples.filter((ex) => {
      const isMastered =
        mode === "VI_TO_JA"
          ? (ex.viToJaMastered ?? ex.mastered)
          : (ex.jaToViMastered ?? ex.mastered);
      if (!isMastered) return true; // always show unmastered (Chưa nhớ)

      const nextReviewDate =
        mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
      if (!nextReviewDate) return true; // show if mastered but no review date set

      return nextReviewDate <= now;
    });`;

const newFilter = `    const dueExamples = forceAll ? allExamples : allExamples.filter((ex) => {
      const nextReviewDate =
        mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
      
      // Nếu chưa từng học (chưa có nextReviewDate), thì hiển thị để học mới
      if (!nextReviewDate) return true; 

      // Nếu đã có nextReviewDate, chỉ hiển thị khi đã đến hạn (<= now)
      return nextReviewDate <= now;
    });`;

content = content.replace(oldFilter, newFilter);
fs.writeFileSync('src/components/SentenceReview.tsx', content);
console.log("Patched sentence filter");
