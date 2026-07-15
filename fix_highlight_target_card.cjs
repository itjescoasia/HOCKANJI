const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find targetWordCard fallback block and move it before uniqueCandidates loop
const targetCardStartIdx = content.indexOf('  // Fallback for the targetWord of this intensive item');
const targetCardEndIdx = content.indexOf('  const newTokens: typeof tokens = [];', targetCardStartIdx);

const targetCardCode = content.substring(targetCardStartIdx, targetCardEndIdx);
content = content.substring(0, targetCardStartIdx) + content.substring(targetCardEndIdx);

// Insert it before uniqueCandidates.forEach
const uniqueCandidatesStartIdx = content.indexOf('  uniqueCandidates.forEach(({ matchStr, card, isStem, matchedForm }) => {');
content = content.substring(0, uniqueCandidatesStartIdx) + targetCardCode + content.substring(uniqueCandidatesStartIdx);

fs.writeFileSync(file, content);
console.log('Patched targetWordCard location!');
