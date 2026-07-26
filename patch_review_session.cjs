const fs = require('fs');

let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

// Add deck to props interface
content = content.replace(
  'interface ReviewSessionProps {\n  dueCards: KanjiCard[];',
  'interface ReviewSessionProps {\n  deck?: KanjiCard[];\n  dueCards: KanjiCard[];'
);

// Add deck to component props
content = content.replace(
  'export default function ReviewSession({ dueCards, onReview, onFreeStudyReview, onClose, onRemoveCard, onUpdateCard, isFreeStudy, isDifficultReview, vocabScores }: ReviewSessionProps) {',
  'export default function ReviewSession({ deck, dueCards, onReview, onFreeStudyReview, onClose, onRemoveCard, onUpdateCard, isFreeStudy, isDifficultReview, vocabScores }: ReviewSessionProps) {'
);

// Pass deck instead of [] to renderExampleHighlight
content = content.replace(
  /renderExampleHighlight\(ex.sentence, currentCard.kanji \|\| currentCard.reading, \[\], currentCard\)/g,
  'renderExampleHighlight(ex.sentence, currentCard.kanji || currentCard.reading, deck || [], currentCard)'
);

content = content.replace(
  /renderExampleHighlight\(currentCard.example, currentCard.kanji \|\| currentCard.reading, \[\], currentCard\)/g,
  'renderExampleHighlight(currentCard.example, currentCard.kanji || currentCard.reading, deck || [], currentCard)'
);

fs.writeFileSync('src/components/ReviewSession.tsx', content);
