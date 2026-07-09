const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// 1. Update HighlightContext and Provider
code = code.replace(
  'hoveredCard: { card: KanjiCard, index: number } | null;',
  'hoveredCard: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string } } | null;'
);
code = code.replace(
  'setHoveredCard: (info: { card: KanjiCard, index: number } | null) => void;',
  'setHoveredCard: (info: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string } } | null) => void;'
);
code = code.replace(
  'const [hoveredCard, setHoveredCard] = useState<{ card: KanjiCard, index: number } | null>(null);',
  'const [hoveredCard, setHoveredCard] = useState<{ card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string } } | null>(null);'
);

// 2. Update allMatchCandidates in tokenizeExampleText
code = code.replace(
  'const allMatchCandidates: { matchStr: string, card: KanjiCard, isStem?: boolean }[] = [];',
  'const allMatchCandidates: { matchStr: string, card: KanjiCard, isStem?: boolean, matchedForm?: any }[] = [];'
);

code = code.replace(
  'allMatchCandidates.push({ matchStr: f.value, card });',
  'allMatchCandidates.push({ matchStr: f.value, card, matchedForm: f });'
);

code = code.replace(
  'uniqueCandidates.forEach(({ matchStr, card, isStem }) => {',
  'uniqueCandidates.forEach(({ matchStr, card, isStem, matchedForm }) => {'
);

// Update tokens type
code = code.replace(
  'let tokens: { text: string; status: \'good\' | \'bad\' | \'neutral\' | \'target\' | \'new\', card?: KanjiCard, occurrenceIndex?: number }[] = [',
  'let tokens: { text: string; status: \'good\' | \'bad\' | \'neutral\' | \'target\' | \'new\', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }[] = ['
);

code = code.replace(
  'newTokens.push({ text: matchStr, status, card });',
  'newTokens.push({ text: matchStr, status, card, matchedForm });'
);

// 3. Update InteractiveWord signature and usage
code = code.replace(
  'const InteractiveWord: React.FC<{ text: string, status: \'good\' | \'bad\' | \'target\' | \'new\', card?: KanjiCard, occurrenceIndex?: number }> = ({ text, status, card, occurrenceIndex = 0 }) => {',
  'const InteractiveWord: React.FC<{ text: string, status: \'good\' | \'bad\' | \'target\' | \'new\', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }> = ({ text, status, card, occurrenceIndex = 0, matchedForm }) => {'
);

code = code.replace(
  'onMouseEnter={() => card && setHoveredCard({ card, index: occurrenceIndex })}',
  'onMouseEnter={() => card && setHoveredCard({ card, index: occurrenceIndex, matchedForm })}'
);

code = code.replace(
  'onClick={() => card && setHoveredCard({ card, index: occurrenceIndex })}',
  'onClick={() => card && setHoveredCard({ card, index: occurrenceIndex, matchedForm })}'
);

code = code.replace(
  'return <InteractiveWord key={i} text={t.text} status={t.status} card={t.card} occurrenceIndex={t.occurrenceIndex} />;',
  'return <InteractiveWord key={i} text={t.text} status={t.status} card={t.card} occurrenceIndex={t.occurrenceIndex} matchedForm={t.matchedForm} />;'
);

// 4. Update RelatedHighlight to use matchedForm
const oldRelatedHighlightTarget = `let target = type === 'hiragana' ? card.reading : card.romaji;`;
const newRelatedHighlightTarget = `
  let target = type === 'hiragana' ? card.reading : card.romaji;
  
  // If we matched a specific form, and that form has reading/romaji, use it!
  if (hoveredCard.matchedForm) {
    if (type === 'hiragana' && hoveredCard.matchedForm.reading) {
      target = hoveredCard.matchedForm.reading;
    } else if (type === 'romaji' && hoveredCard.matchedForm.romaji) {
      target = hoveredCard.matchedForm.romaji;
    }
  }
`;
code = code.replace(oldRelatedHighlightTarget, newRelatedHighlightTarget);

fs.writeFileSync('src/utils/highlight.tsx', code);
