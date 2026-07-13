const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// Replace context definition
content = content.replace(
  `export const HighlightContext = React.createContext<{
  hoveredCard: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null;
  setHoveredCard: (info: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null) => void;
  onEditCard?: (card: KanjiCard) => void;
}>({
  hoveredCard: null,
  setHoveredCard: () => {},
});`,
  `export const HighlightContext = React.createContext<{
  hoveredCard: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null;
  setHoveredCard: (info: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null, force?: boolean) => void;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  onEditCard?: (card: KanjiCard) => void;
}>({
  hoveredCard: null,
  setHoveredCard: () => {},
  isLocked: false,
  setLocked: () => {},
});`
);

content = content.replace(
  `export const HighlightProvider: React.FC<{ children: React.ReactNode, onEditCard?: (card: KanjiCard) => void }> = ({ children, onEditCard }) => {
  const [hoveredCard, setHoveredCard] = useState<{ card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null>(null);
  return (
    <HighlightContext.Provider value={{ hoveredCard, setHoveredCard, onEditCard }}>
      {children}
    </HighlightContext.Provider>
  );
};`,
  `export const HighlightProvider: React.FC<{ children: React.ReactNode, onEditCard?: (card: KanjiCard) => void }> = ({ children, onEditCard }) => {
  const [hoveredCard, setHoveredCardState] = useState<{ card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null>(null);
  const [isLocked, setLocked] = useState(false);
  
  const setHoveredCard = (info: any, force = false) => {
    if (isLocked && !force) return;
    setHoveredCardState(info);
  };
  
  return (
    <HighlightContext.Provider value={{ hoveredCard, setHoveredCard, isLocked, setLocked, onEditCard }}>
      {children}
    </HighlightContext.Provider>
  );
};`
);

fs.writeFileSync('src/utils/highlight.tsx', content);
