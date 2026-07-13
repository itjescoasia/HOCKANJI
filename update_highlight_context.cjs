const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// Update Context definition
content = content.replace(
  `  setHoveredCard: (info: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null) => void;\n}>({`,
  `  setHoveredCard: (info: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null) => void;\n  onEditCard?: (card: KanjiCard) => void;\n}>({`
);

// Update Provider props
content = content.replace(
  `export const HighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {`,
  `export const HighlightProvider: React.FC<{ children: React.ReactNode, onEditCard?: (card: KanjiCard) => void }> = ({ children, onEditCard }) => {`
);

// Update Provider value
content = content.replace(
  `<HighlightContext.Provider value={{ hoveredCard, setHoveredCard }}>`,
  `<HighlightContext.Provider value={{ hoveredCard, setHoveredCard, onEditCard }}>`
);

fs.writeFileSync('src/utils/highlight.tsx', content);
