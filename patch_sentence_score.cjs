const fs = require('fs');
let content = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

content = content.replace('const newScore = Math.max(0, oldScore + scoreDelta);', 'const newScore = oldScore + scoreDelta;');
fs.writeFileSync('src/components/SentenceReview.tsx', content);
console.log("Patched Math.max out");
