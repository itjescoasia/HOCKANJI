const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const oldLogic = `  if (!lowerText.includes(matchStr.toLowerCase())) {
    // Try prefix matching for conjugated verbs/adjectives
    let found = false;
    for (let i = matchStr.length - 1; i >= Math.max(1, Math.floor(matchStr.length / 2)); i--) {
      const prefix = matchStr.substring(0, i);
      if (lowerText.includes(prefix.toLowerCase())) {
        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found) {
      return <Fragment>{text}</Fragment>;
    }
  }`;

const newLogic = `  if (!lowerText.includes(matchStr.toLowerCase())) {
    // Try prefix matching for conjugated verbs/adjectives
    let found = false;
    for (let i = matchStr.length - 1; i >= Math.max(1, Math.floor(matchStr.length / 2)); i--) {
      const prefix = matchStr.substring(0, i);
      if (lowerText.includes(prefix.toLowerCase())) {
        if (type === 'hiragana') {
            const regex = new RegExp(\`(\${prefix}[ぁ-ん]*)\`, 'i');
            const match = text.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        } else if (type === 'romaji') {
            const regex = new RegExp(\`(?:^|[^a-z])(\${prefix}[a-z]*)\`, 'i');
            const match = text.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        }
        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found) {
      return <Fragment>{text}</Fragment>;
    }
  }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/utils/highlight.tsx', content);
console.log('Fixed RelatedHighlight in src/utils/highlight.tsx');
