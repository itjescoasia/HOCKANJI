const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/\{ \(currentCard\.kanjiExplanation.*?\(\n/g, '{ (currentCard.kanjiExplanation || currentCard.wordType) && (\n');
  code = code.replace(/\{ \(card\.kanjiExplanation.*?\(\n/g, '{ (card.kanjiExplanation || card.wordType) && (\n');
  fs.writeFileSync(file, code);
}

fixFile('src/components/ReviewSession.tsx');
fixFile('src/components/VocabList.tsx');
