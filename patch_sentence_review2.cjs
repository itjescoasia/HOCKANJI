const fs = require('fs');
const file = 'src/components/SentenceReview.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/let isMastered = false;\s*if \(grade === 'good'\) \{\s*isMastered = true;\s*\} else \{\s*newFailCount \+= 1;\s*\}/g,
`const currentIsMastered = mode === "VI_TO_JA" ? ex.viToJaMastered : ex.jaToViMastered;
            let isMastered = currentIsMastered || false;
            if (grade === 'good') {
              isMastered = true;
            } else if (grade === 'forgot') {
              newFailCount += 1;
              isMastered = false;
            } else {
              newFailCount += 1;
            }`);

code = code.replace(/let isMastered = false;\s*if \(grade === 'good'\) \{\s*nextInterval = \(\!currentInterval \|\| currentInterval === 0\) \? 1 :\s*\(currentInterval === 1 \? 3 :\s*\(currentInterval === 3 \? 7 : currentInterval \* 2\)\);\s*isMastered = true;\s*\} else if \(grade === 'hard'\) \{\s*nextInterval = 1;\s*newFailCount \+= 1;\s*isMastered = false;\s*\} else if \(grade === 'forgot'\) \{\s*nextInterval = 0;\s*isMastered = false;\s*\}/g,
`const currentIsMastered = mode === "VI_TO_JA" ? ex.viToJaMastered : ex.jaToViMastered;
          let isMastered = currentIsMastered || false;
          if (grade === 'good') {
            nextInterval = (!currentInterval || currentInterval === 0) ? 1 :
                            (currentInterval === 1 ? 3 :
                            (currentInterval === 3 ? 7 : currentInterval * 2));
            isMastered = true;
          } else if (grade === 'hard') {
            nextInterval = 1;
            newFailCount += 1;
          } else if (grade === 'forgot') {
            nextInterval = 0;
            isMastered = false;
          }`);

fs.writeFileSync(file, code);
console.log("Patched 2 successfully.");
