const fs = require('fs');
const file = 'src/components/SentenceReview.tsx';
let code = fs.readFileSync(file, 'utf8');

// First replace: isMastered logic in setExamples block
const target1 = `          let isMastered = false;
          if (grade === 'good') {
            nextInterval = (!currentInterval || currentInterval === 0) ? 1 :
                            (currentInterval === 1 ? 3 :
                            (currentInterval === 3 ? 7 : currentInterval * 2));
            isMastered = true;
          } else if (grade === 'hard') {
            nextInterval = 1;
            newFailCount += 1;
            isMastered = false;
          } else if (grade === 'forgot') {
            nextInterval = 0;
            isMastered = false;
          }`;

const replacement1 = `          const currentIsMastered = mode === "VI_TO_JA" ? ex.viToJaMastered : ex.jaToViMastered;
          let isMastered = currentIsMastered || false;
          if (grade === 'good') {
            nextInterval = (!currentInterval || currentInterval === 0) ? 1 :
                            (currentInterval === 1 ? 3 :
                            (currentInterval === 3 ? 7 : currentInterval * 2));
            isMastered = true;
          } else if (grade === 'hard') {
            nextInterval = 1;
            newFailCount += 1;
            // Keep previous mastery status if it was hard
          } else if (grade === 'forgot') {
            nextInterval = 0;
            isMastered = false;
          }`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
} else {
  console.log("Could not find target1");
}

// Second replace: isMastered logic in updatedExamples block
const target2 = `            let isMastered = false;
            if (grade === 'good') {
              isMastered = true;
            } else {
              newFailCount += 1;
            }`;

const replacement2 = `            const currentIsMastered = mode === "VI_TO_JA" ? ex.viToJaMastered : ex.jaToViMastered;
            let isMastered = currentIsMastered || false;
            if (grade === 'good') {
              isMastered = true;
            } else if (grade === 'forgot') {
              newFailCount += 1;
              isMastered = false;
            } else {
              newFailCount += 1;
            }`;

if (code.includes(target2)) {
  code = code.replace(target2, replacement2);
} else {
  console.log("Could not find target2");
}

// Third replace: reviewScore update
const target3 = `        const newScore = oldScore + scoreDelta;`;
const replacement3 = `        const newScore = Math.max(0, oldScore + scoreDelta);`;

if (code.includes(target3)) {
  code = code.replace(target3, replacement3);
} else {
  console.log("Could not find target3");
}

fs.writeFileSync(file, code);
console.log("Patched SentenceReview successfully.");
