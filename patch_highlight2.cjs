const fs = require('fs');
const content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target2 = `    if (token.text.includes(targetToHighlight)) {
      const parts = token.text.split(targetToHighlight);
      parts.forEach((part, i) => {
        if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
        if (i < parts.length - 1) newTokens.push({ text: targetToHighlight, status: 'target', card: targetWordCard });
      });
    } else {
      newTokens.push(token);
    }`;

const replacement2 = `    if (targetToHighlight !== targetWord && targetToHighlight.length > 0 && token.text.includes(targetToHighlight)) {
      // It's a stem match. Try to include trailing hiragana.
      const safeStem = targetToHighlight.replace(/[.*+?^\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
      // Match the stem followed by any number of hiragana characters
      const regex = new RegExp(\`(\${safeStem}[ぁ-ん]*)\`, 'g');
      const parts = token.text.split(regex);
      parts.forEach((part, i) => {
        if (part.length > 0) {
          if (part.startsWith(targetToHighlight)) {
            newTokens.push({ text: part, status: 'target', card: targetWordCard });
          } else {
            newTokens.push({ text: part, status: 'neutral' });
          }
        }
      });
    } else if (token.text.includes(targetToHighlight)) {
      const parts = token.text.split(targetToHighlight);
      parts.forEach((part, i) => {
        if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
        if (i < parts.length - 1) newTokens.push({ text: targetToHighlight, status: 'target', card: targetWordCard });
      });
    } else {
      newTokens.push(token);
    }`;

let newContent = content.replace(target2, replacement2);
fs.writeFileSync('src/utils/highlight.tsx', newContent);
console.log("Patched fallback logic for dynamic verb forms");
