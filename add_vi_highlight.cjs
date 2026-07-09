const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const newComponent = `
export const HighlightVietnamese: React.FC<{ text: string }> = ({ text }) => {
  const { hoveredCard } = useHighlight();
  if (!hoveredCard || !text) return <Fragment>{text}</Fragment>;

  const card = hoveredCard.card;
  if (!card || !card.meaning) return <Fragment>{text}</Fragment>;

  const meanings = card.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
  
  let bestMatch = { index: -1, length: 0, str: '' };
  const lowerText = text.toLowerCase();

  meanings.forEach(m => {
    const lowerM = m.toLowerCase();
    const idx = lowerText.indexOf(lowerM);
    if (idx !== -1 && m.length > bestMatch.length) {
      bestMatch = { index: idx, length: m.length, str: text.substring(idx, idx + m.length) };
    }
  });

  if (bestMatch.index === -1) {
      return <Fragment>{text}</Fragment>;
  }

  const before = text.substring(0, bestMatch.index);
  const match = bestMatch.str;
  const after = text.substring(bestMatch.index + bestMatch.length);

  return (
    <Fragment>
      {before}
      <span className="bg-theme-accent text-white font-bold px-1 rounded scale-110 shadow-sm inline-block z-10 relative transition-all duration-200">
        {match}
      </span>
      {after}
    </Fragment>
  );
};
`;

code = code.replace(
  "export const tokenizeExampleText",
  newComponent + "\nexport const tokenizeExampleText"
);

fs.writeFileSync('src/utils/highlight.tsx', code);
console.log("Added HighlightVietnamese");
