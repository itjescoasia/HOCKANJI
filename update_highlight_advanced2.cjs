const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf-8');

// Insert the occurrence counting before returning tokens
code = code.replace(
  /  tokens = newTokens;\n  return tokens;\n\};/,
  `  tokens = newTokens;
  const cardCounts = new Map<string, number>();
  tokens.forEach(token => {
    if (token.card) {
      const key = token.card.id || token.text;
      const count = cardCounts.get(key) || 0;
      token.occurrenceIndex = count;
      cardCounts.set(key, count + 1);
    }
  });
  return tokens;
};`
);

fs.writeFileSync('src/utils/highlight.tsx', code);
console.log('done advanced highlight 2');
