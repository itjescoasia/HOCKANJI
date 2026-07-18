const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target = `      // Try combinations of words from longest to shortest
      for (let numWords = words.length; numWords >= 1; numWords--) {
        for (let start = 0; start <= words.length - numWords; start++) {`;

const replacement = `      // Try combinations of words from longest to shortest. Limit to max 6 words to prevent UI freeze
      const maxPhraseLength = Math.min(words.length, 6);
      for (let numWords = maxPhraseLength; numWords >= 1; numWords--) {
        let foundMatch = false;
        for (let start = 0; start <= words.length - numWords; start++) {`;

const target2 = `              if (exactIdx !== -1 && matchedStr.length > bestMatch.length) {
                bestMatch = { index: exactIdx, length: matchedStr.length, str: cleanText.substring(exactIdx, exactIdx + matchedStr.length) };
              }
            }
          }
        }
      }
    });
  }`;

const replacement2 = `              if (exactIdx !== -1 && matchedStr.length > bestMatch.length) {
                bestMatch = { index: exactIdx, length: matchedStr.length, str: cleanText.substring(exactIdx, exactIdx + matchedStr.length) };
                foundMatch = true;
              }
            }
          }
        }
        if (foundMatch) break;
      }
    });
  }`;

file = file.replace(target, replacement);
file = file.replace(target2, replacement2);
fs.writeFileSync('src/utils/highlight.tsx', file);
console.log('Patched HighlightVietnamese');
