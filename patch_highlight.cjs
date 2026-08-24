const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  '{renderExampleHighlight(ex.sentence, viewingCard.kanji || viewingCard.reading, [], viewingCard)}',
  '{renderExampleHighlight(ex.sentence, viewingCard.kanji || viewingCard.reading, deck, viewingCard)}'
);

code = code.replace(
  '{renderExampleHighlight(viewingCard.example!, viewingCard.kanji || viewingCard.reading, [], viewingCard)}',
  '{renderExampleHighlight(viewingCard.example!, viewingCard.kanji || viewingCard.reading, deck, viewingCard)}'
);

fs.writeFileSync('src/components/VocabList.tsx', code);
