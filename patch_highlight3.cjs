const fs = require('fs');
const content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target3 = `        // Valid match found!
        if (idx > 0) {
          newTokens.push({ text: currentText.substring(0, idx), status: 'neutral' });
        }
        newTokens.push({ text: matchStr, status, card, matchedForm });
        
        currentText = currentText.substring(idx + matchStr.length);
        searchIndex = 0;`;

const replacement3 = `        // Valid match found!
        if (idx > 0) {
          newTokens.push({ text: currentText.substring(0, idx), status: 'neutral' });
        }
        
        let actualMatchStr = matchStr;
        if (isStem) {
           let j = idx + matchStr.length;
           while (j < currentText.length && /[ぁ-ん]/.test(currentText[j])) {
               actualMatchStr += currentText[j];
               j++;
           }
        }
        
        newTokens.push({ text: actualMatchStr, status, card, matchedForm });
        
        currentText = currentText.substring(idx + actualMatchStr.length);
        searchIndex = 0;`;

let newContent = content.replace(target3, replacement3);
fs.writeFileSync('src/utils/highlight.tsx', newContent);
console.log("Patched stem match to include trailing hiragana in uniqueCandidates loop");
