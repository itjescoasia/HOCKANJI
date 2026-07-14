const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

// Change rotateX to rotateY
code = code.replace(/rotateX: showAnswer \? 180 : 0/g, 'rotateY: showAnswer ? 180 : 0');
code = code.replace(/rotateX\(180deg\)/g, 'rotateY(180deg)');

// Add instruction to click to flip
code = code.replace(/Nhấn <kbd className="[^"]+">Space<\/kbd> hoặc chạm vào thẻ để xem đáp án/g, 'Chạm vào thẻ hoặc nhấn <kbd className="px-2 py-1 bg-theme-panel border border-theme-subtle rounded text-theme-primary font-sans mx-1">Space</kbd> để lật thẻ');

// Update onClick handler to toggle showAnswer
code = code.replace(
  /onClick=\{\(\) => !showAnswer && !\(isFreeStudy && exerciseType !== 'flip'\) && setShowAnswer\(true\)\}/g,
  `onClick={() => {
            if (!(isFreeStudy && exerciseType !== 'flip')) {
              setShowAnswer(!showAnswer);
            }
          }}`
);

// We need to fix the condition where cursor-pointer is applied
code = code.replace(
  /\$\{\(!showAnswer && isFreeStudy && exerciseType !== 'flip'\) \? '' : 'cursor-pointer'\}/g,
  `\${!(isFreeStudy && exerciseType !== 'flip') ? 'cursor-pointer' : ''}`
);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
