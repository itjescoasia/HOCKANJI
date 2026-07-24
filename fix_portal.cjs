const fs = require('fs');

let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// 1. Add createPortal import
if (!content.includes("import { createPortal } from 'react-dom';")) {
  content = content.replace(
    "import React, { Fragment, useState, useRef, useEffect, useContext } from 'react';",
    "import React, { Fragment, useState, useRef, useEffect, useContext } from 'react';\nimport { createPortal } from 'react-dom';"
  );
}

// 2. Add rect state to InteractiveWord
const rectState = `
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = () => {
    if (containerRef.current) {
      setRect(containerRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [isOpen]);
`;

if (!content.includes("const [rect, setRect] = useState")) {
  content = content.replace(
    /const \{ setHoveredCard, onEditCard, isLocked, setLocked \} = useContext\(HighlightContext\);/,
    `const { setHoveredCard, onEditCard, isLocked, setLocked } = useContext(HighlightContext);${rectState}`
  );
}

// 3. Replace the AnimatePresence block with the portal block
const targetPattern = /<AnimatePresence>[\s\S]*?<\/AnimatePresence>/;

const portalBlock = `<AnimatePresence>
        {isOpen && rect && createPortal(
          <motion.span
            initial={{ opacity: 0, scale: 0.5, rotateY: 360, y: -20, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.5, rotateY: -360, y: -20, x: "-50%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: rect.bottom + 8,
              left: rect.left + rect.width / 2,
              zIndex: 999999
            }}
            className="w-max max-w-[280px] max-h-[250px] overflow-y-auto bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-4 flex flex-col gap-1 text-left font-sans text-base whitespace-normal origin-top"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2">
                <strong className="text-xl font-serif text-theme-primary leading-none">{card.kanji || card.reading}</strong>
                <button 
                  onClick={(e) => playAudio(e, text)}
                  className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                {onEditCard && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); if (onEditCard) onEditCard(card); window.dispatchEvent(new CustomEvent('editCard', { detail: card })); }}
                    className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 ml-1"
                    title="Chỉnh sửa từ vựng"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </span>
              {card.sinoVietnamese && <span className="text-[10px] text-theme-accent uppercase tracking-wider mb-0.5 whitespace-nowrap">{card.sinoVietnamese}</span>}
            </span>
            
            {card.reading && card.kanji && (
              <span className="text-sm text-theme-primary/70">{card.reading} {card.romaji ? \`(\${card.romaji})\` : ''}</span>
            )}
            <span className="text-sm text-theme-primary mt-1 border-t border-theme-subtle/50 pt-1">{card.meaning}</span>
            {(card.wordType || card.kanjiExplanation) && (
               <span className="text-xs text-theme-primary mt-1 border-t border-theme-subtle/50 pt-1 flex flex-col gap-1">
                 {card.wordType && <span className="font-semibold text-theme-accent">Loại từ: {card.wordType}</span>}
                 {card.kanjiExplanation && <span className="opacity-80 italic whitespace-pre-wrap">{card.kanjiExplanation}</span>}
               </span>
            )}
          </motion.span>,
          document.body
        )}
      </AnimatePresence>`;

content = content.replace(targetPattern, portalBlock);

fs.writeFileSync('src/utils/highlight.tsx', content);

