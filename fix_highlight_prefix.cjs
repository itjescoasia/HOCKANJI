const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const targetStr = `for (let i = matchStr.length - 1; i >= Math.max(1, Math.floor(matchStr.length / 2)); i--) {`;
const replaceStr = `const minPrefixLength = type === 'hiragana' ? 2 : 3;
    for (let i = matchStr.length - 1; i >= Math.max(minPrefixLength, Math.floor(matchStr.length / 2)); i--) {`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/utils/highlight.tsx', content);
