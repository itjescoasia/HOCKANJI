const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

file = file.replace(
  'if (card.kanji && (!card.forms || card.forms.length === 0)) {',
  'if (card.kanji) {'
);

fs.writeFileSync('src/utils/highlight.tsx', file);
