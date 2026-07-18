const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const regexTarget = /const safePhrase = phrase\.replace.*?\} \/\/ End of inner loop/s;
// Let's just find the block to replace.

const lines = file.split('\n');
let newLines = [];
let skip = false;
let foundTarget = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const safePhrase = phrase.replace')) {
    skip = true;
    foundTarget = true;
    
    newLines.push(`          let searchIdx = 0;`);
    newLines.push(`          const phraseLower = phrase.toLowerCase();`);
    newLines.push(`          while (searchIdx < lowerText.length) {`);
    newLines.push(`            const idx = lowerText.indexOf(phraseLower, searchIdx);`);
    newLines.push(`            if (idx === -1) break;`);
    newLines.push(`            const before = idx === 0 ? ' ' : lowerText[idx - 1];`);
    newLines.push(`            const after = idx + phrase.length >= lowerText.length ? ' ' : lowerText[idx + phrase.length];`);
    newLines.push(`            const isWordChar = (c) => /[\\p{L}\\p{N}]/u.test(c);`);
    newLines.push(`            if (!isWordChar(before) && !isWordChar(after)) {`);
    newLines.push(`              if (phrase.length > bestMatch.length) {`);
    newLines.push(`                bestMatch = { index: idx, length: phrase.length, str: cleanText.substring(idx, idx + phrase.length) };`);
    newLines.push(`                foundMatch = true;`);
    newLines.push(`              }`);
    newLines.push(`            }`);
    newLines.push(`            searchIdx = idx + 1;`);
    newLines.push(`          }`);
  }
  
  if (skip) {
    if (lines[i].includes('if (foundMatch) break;')) {
      skip = false;
      newLines.push(lines[i]);
    }
    // skip this line
  } else {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync('src/utils/highlight.tsx', newLines.join('\n'));
console.log('Patched');
