const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

content = content.replace(
  `    index = hoveredCard.occurrenceIndex?.reading || 0;`,
  `    index = hoveredCard.index || 0;`
);

content = content.replace(
  `    index = hoveredCard.occurrenceIndex?.romaji || 0;`,
  `    index = hoveredCard.index || 0;`
);

fs.writeFileSync('src/utils/highlight.tsx', content);
