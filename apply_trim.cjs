const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update uniqueCandidates.forEach logic
content = content.replace(
`        let actualMatchStr = matchStr;
        // Removed greedy trailing hiragana consumption to prevent over-highlighting (e.g. 分かりにくいです)
        
        
        newTokens.push({ text: actualMatchStr, status, card, matchedForm });`,
`        let actualMatchStr = trimAuxiliary(matchStr);
        // Avoid trimming entirely, just in case
        if (!actualMatchStr) actualMatchStr = matchStr;
        
        newTokens.push({ text: actualMatchStr, status, card, matchedForm });`
);

// 2. Update targetWord fallback logic
content = content.replace(
`    let targetToHighlight = targetWord;
    
    if (!token.text.includes(targetWord)) {
       // Try removing trailing okurigana
       const stem = targetWord.replace(/[ぁ-ん]+$/, '');`,
`    let targetToHighlight = trimAuxiliary(targetWord);
    if (!targetToHighlight) targetToHighlight = targetWord;
    
    if (!token.text.includes(targetToHighlight)) {
       // Try removing trailing okurigana
       const stem = targetWord.replace(/[ぁ-ん]+$/, '');`
);

fs.writeFileSync(file, content);
console.log('Applied trimAuxiliary to highlight tokens!');
