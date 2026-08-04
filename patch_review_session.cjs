const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const oldCode = `        <div 
          className={\`w-full aspect-[4/3] relative mb-10 \${!(isFreeStudy && exerciseType !== 'flip') ? 'cursor-pointer' : ''}\`}
          style={{ perspective: 1000 }}
          onClick={() => {
            if (!(isFreeStudy && exerciseType !== 'flip')) {
              setShowAnswer(!showAnswer);
            }
          }}
        >`;

const newCode = `        <div 
          className={\`w-full aspect-[4/3] relative mb-10 \${!(isFreeStudy && exerciseType !== 'flip') ? 'cursor-pointer' : ''}\`}
          style={{ perspective: 1000 }}
          onClick={() => {
            if (!(isFreeStudy && exerciseType !== 'flip')) {
              setShowAnswer(true);
            }
          }}
        >`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('src/components/ReviewSession.tsx', content);
  console.log('Patched ReviewSession.tsx correctly!');
} else {
  console.log('Target code not found in ReviewSession.tsx');
}
