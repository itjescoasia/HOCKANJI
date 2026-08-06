const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

content = content.replace(
  `{card.kanjiExplanation && <span className="text-sm text-theme-primary/80 italic leading-relaxed">{card.kanjiExplanation}</span>}`,
  `{card.kanjiExplanation && <span className="text-sm text-theme-primary/80 italic leading-relaxed whitespace-pre-wrap break-words">{card.kanjiExplanation}</span>}`
);

fs.writeFileSync('src/utils/highlight.tsx', content);
