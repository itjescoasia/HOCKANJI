const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('    if (targetToHighlight !== targetWord && targetToHighlight.length > 0 && token.text.includes(targetToHighlight)) {');
const endIdx = content.indexOf('    } else if (token.text.includes(targetToHighlight)) {', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newCode = `    if (targetToHighlight !== targetWord && targetToHighlight.length > 0 && token.text.includes(targetToHighlight)) {
      const safeStem = targetToHighlight.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
      const regex = new RegExp(\`(\\\${safeStem}[ぁ-ん]*)\`, 'g');
      const parts = token.text.split(regex);
      parts.forEach((part) => {
        if (part.length > 0) {
          if (part.startsWith(targetToHighlight)) {
            let trimmed = trimAuxiliary(part);
            if (!trimmed) trimmed = part;
            newTokens.push({ text: trimmed, status: 'target', card: targetWordCard });
            const remainder = part.substring(trimmed.length);
            if (remainder.length > 0) {
              newTokens.push({ text: remainder, status: 'neutral' });
            }
          } else {
            newTokens.push({ text: part, status: 'neutral' });
          }
        }
      });
\n`;
    content = content.substring(0, startIdx) + newCode + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Patched fallback logic successfully with substring!');
} else {
    console.error('Could not find start or end index');
}
