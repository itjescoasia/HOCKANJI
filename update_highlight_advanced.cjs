const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf-8');

// Update Context definition
code = code.replace(
`export const HighlightContext = React.createContext<{
  hoveredCard: KanjiCard | null;
  setHoveredCard: (card: KanjiCard | null) => void;
}>({
  hoveredCard: null,
  setHoveredCard: () => {},
});`,
`export const HighlightContext = React.createContext<{
  hoveredCard: { card: KanjiCard, index: number } | null;
  setHoveredCard: (info: { card: KanjiCard, index: number } | null) => void;
}>({
  hoveredCard: null,
  setHoveredCard: () => {},
});`
);

// Update Provider
code = code.replace(
`export const HighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredCard, setHoveredCard] = useState<KanjiCard | null>(null);`,
`export const HighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredCard, setHoveredCard] = useState<{ card: KanjiCard, index: number } | null>(null);`
);

// Update RelatedHighlight
code = code.replace(
`export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
  const { hoveredCard } = React.useContext(HighlightContext);

  if (!hoveredCard || !text) return <Fragment>{text}</Fragment>;

  const target = type === 'hiragana' ? hoveredCard.reading : hoveredCard.romaji;
  
  if (!target || !text.toLowerCase().includes(target.toLowerCase())) {
    return <Fragment>{text}</Fragment>;
  }

  const regex = new RegExp(\`(\${target})\`, 'i');
  const parts = text.split(regex);

  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === target.toLowerCase()) {
          return <span key={i} className="bg-theme-accent/20 text-theme-accent font-bold px-1 rounded transition-colors">{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );
};`,
`export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
  const { hoveredCard } = React.useContext(HighlightContext);

  if (!hoveredCard || !text) return <Fragment>{text}</Fragment>;

  const { card, index } = hoveredCard;
  const target = type === 'hiragana' ? card.reading : card.romaji;
  
  if (!target || !text.toLowerCase().includes(target.toLowerCase())) {
    return <Fragment>{text}</Fragment>;
  }

  const regex = new RegExp(\`(\${target})\`, 'gi');
  const parts = text.split(regex);

  let matchCount = 0;
  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === target.toLowerCase()) {
          const isCurrentMatch = matchCount === index;
          matchCount++;
          return <span key={i} className={\`px-1 rounded transition-all duration-200 \${isCurrentMatch ? 'bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative' : 'bg-theme-accent/20 text-theme-accent font-bold'}\`}>{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );
};`
);

// Update InteractiveWord signature
code = code.replace(
  `const InteractiveWord: React.FC<{ text: string, status: 'good' | 'bad' | 'target' | 'new', card?: KanjiCard }> = ({ text, status, card }) => {`,
  `const InteractiveWord: React.FC<{ text: string, status: 'good' | 'bad' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number }> = ({ text, status, card, occurrenceIndex = 0 }) => {`
);

// Update InteractiveWord onMouse...
code = code.replace(
  `onMouseEnter={() => card && setHoveredCard(card)} onMouseLeave={() => setHoveredCard(null)} onClick={() => card && setHoveredCard(card)}`,
  `onMouseEnter={() => card && setHoveredCard({ card, index: occurrenceIndex })} onMouseLeave={() => setHoveredCard(null)} onClick={() => card && setHoveredCard({ card, index: occurrenceIndex })}`
);

// Update tokenizeExampleText tokens type
code = code.replace(
  `  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' | 'new', card?: KanjiCard }[] = [`,
  `  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number }[] = [`
);

// Insert the occurrence counting before returning tokens
code = code.replace(
  `  tokens = newTokens;
  return tokens;
};`,
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

// Update renderExampleHighlight to pass occurrenceIndex
code = code.replace(
  `        return <InteractiveWord key={i} text={t.text} status={t.status} card={t.card} />;`,
  `        return <InteractiveWord key={i} text={t.text} status={t.status} card={t.card} occurrenceIndex={t.occurrenceIndex} />;`
);


fs.writeFileSync('src/utils/highlight.tsx', code);
console.log('done advanced highlight');
