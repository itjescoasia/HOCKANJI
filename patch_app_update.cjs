const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `onUpdateWord={sentenceReviewTargetDeck ? undefined : updateIntensiveWord}`,
  `onUpdateWord={updateIntensiveWord}`
);

fs.writeFileSync(file, content);
console.log('Patched App.tsx updateIntensiveWord');
