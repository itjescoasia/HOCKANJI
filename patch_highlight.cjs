const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const oldLogic = `        // Valid match found!
        if (idx > 0) {
          newTokens.push({ text: currentText.substring(0, idx), status: 'neutral' });
        }
        
        let actualMatchStr = matchStr;
        if (!matchedForm) {
          actualMatchStr = trimAuxiliary(matchStr);
          if (!actualMatchStr) actualMatchStr = matchStr;
        }
        
        newTokens.push({ text: actualMatchStr, status, card, matchedForm });
        
        currentText = currentText.substring(idx + actualMatchStr.length);
        searchIndex = 0;`;

const newLogic = `        // Valid match found!
        if (idx > 0) {
          newTokens.push({ text: currentText.substring(0, idx), status: 'neutral' });
        }
        
        let matchLen = matchStr.length;
        if (isStem) {
           // Consume trailing hiragana
           while (idx + matchLen < currentText.length) {
              const c = currentText[idx + matchLen];
              if (/[ぁ-ん]/.test(c)) {
                 matchLen++;
              } else {
                 break;
              }
           }
        }
        
        let actualMatchStr = matchStr;
        if (!matchedForm && !isStem) {
          actualMatchStr = trimAuxiliary(matchStr);
          if (!actualMatchStr) actualMatchStr = matchStr;
        }
        
        if (isStem) {
          actualMatchStr = currentText.substring(idx, idx + matchLen);
        }
        
        newTokens.push({ text: actualMatchStr, status, card, matchedForm });
        
        currentText = currentText.substring(idx + actualMatchStr.length);
        searchIndex = 0;`;

if (file.includes('newTokens.push({ text: currentText.substring(0, idx), status: \'neutral\' });')) {
  file = file.replace(oldLogic, newLogic);
  fs.writeFileSync('src/utils/highlight.tsx', file);
  console.log('Patched highlight.tsx');
} else {
  console.log('Could not find old logic in highlight.tsx');
}
