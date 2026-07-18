const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target = `          const safePhrase = phrase.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
          // Use Unicode letters and digits for word boundaries
          const regex = new RegExp(\`(?:^|[^\\\\p{L}\\\\p{N}])(\\\${safePhrase})(?:[^\\\\p{L}\\\\p{N}]|$)\`, 'giu');
          
          const matches = [...cleanText.matchAll(regex)];
          for (const match of matches) {
            if (match.index !== undefined) {
              const matchedStr = match[1];
              const exactIdx = cleanText.indexOf(matchedStr, match.index);
              if (exactIdx !== -1 && matchedStr.length > bestMatch.length) {
                bestMatch = { index: exactIdx, length: matchedStr.length, str: cleanText.substring(exactIdx, exactIdx + matchedStr.length) };
                foundMatch = true;
              }
            }
          }`;

const replacement = `          let searchIdx = 0;
          const phraseLower = phrase.toLowerCase();
          while (searchIdx < lowerText.length) {
            const idx = lowerText.indexOf(phraseLower, searchIdx);
            if (idx === -1) break;
            
            // Check boundaries
            const before = idx === 0 ? ' ' : lowerText[idx - 1];
            const after = idx + phrase.length >= lowerText.length ? ' ' : lowerText[idx + phrase.length];
            const isWordChar = (c) => /[\\p{L}\\p{N}]/u.test(c);
            
            if (!isWordChar(before) && !isWordChar(after)) {
              if (phrase.length > bestMatch.length) {
                bestMatch = { index: idx, length: phrase.length, str: cleanText.substring(idx, idx + phrase.length) };
                foundMatch = true;
              }
            }
            searchIdx = idx + 1;
          }`;

if (file.includes(target)) {
  file = file.replace(target, replacement);
  fs.writeFileSync('src/utils/highlight.tsx', file);
  console.log('Patched HighlightVietnamese performance again');
} else {
  console.log('Could not find target');
}
