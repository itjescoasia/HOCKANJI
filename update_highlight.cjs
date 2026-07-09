const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf-8');

// Insert HighlightContext
const contextCode = `
export const HighlightContext = React.createContext<{
  hoveredCard: KanjiCard | null;
  setHoveredCard: (card: KanjiCard | null) => void;
}>({
  hoveredCard: null,
  setHoveredCard: () => {},
});

export const HighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredCard, setHoveredCard] = useState<KanjiCard | null>(null);
  return (
    <HighlightContext.Provider value={{ hoveredCard, setHoveredCard }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
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
};
`;

code = code.replace("import React, { Fragment, useState, useRef, useEffect } from 'react';", "import React, { Fragment, useState, useRef, useEffect, useContext } from 'react';" + contextCode);

// Update InteractiveWord
code = code.replace(
  "const containerRef = useRef<HTMLSpanElement>(null);",
  "const containerRef = useRef<HTMLSpanElement>(null);\n  const { setHoveredCard } = useContext(HighlightContext);"
);

code = code.replace(
  '<span className="relative inline-block" ref={containerRef}>',
  `<span className="relative inline-block" ref={containerRef} onMouseEnter={() => card && setHoveredCard(card)} onMouseLeave={() => setHoveredCard(null)} onClick={() => card && setHoveredCard(card)}>`
);

fs.writeFileSync('src/utils/highlight.tsx', code);
console.log('done');
