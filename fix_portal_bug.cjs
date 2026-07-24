const fs = require('fs');

let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// 1. Add popupRef
if (!content.includes('const popupRef = useRef<HTMLSpanElement>(null);')) {
  content = content.replace(
    'const containerRef = useRef<HTMLSpanElement>(null);',
    'const containerRef = useRef<HTMLSpanElement>(null);\n  const popupRef = useRef<HTMLSpanElement>(null);'
  );
}

// 2. Fix handleClickOutside
content = content.replace(
  /if \(containerRef\.current && !containerRef\.current\.contains\(event\.target as Node\)\) \{/,
  'if (containerRef.current && !containerRef.current.contains(event.target as Node) && (!popupRef.current || !popupRef.current.contains(event.target as Node))) {'
);

// 3. Fix AnimatePresence and createPortal nesting
content = content.replace(
  /<AnimatePresence>\s*\{isOpen && rect && createPortal\(/,
  "{typeof document !== 'undefined' && createPortal(\n        <AnimatePresence>"
);
content = content.replace(
  /,\s*document\.body\s*\)\}\s*<\/AnimatePresence>/,
  "</AnimatePresence>,\n        document.body\n      )}"
);

// 4. Add ref to motion.span
if (!content.includes('ref={popupRef}')) {
  content = content.replace(
    /className="w-max max-w-\[280px\]/,
    'ref={popupRef}\n            className="w-max max-w-[280px]'
  );
}

// 5. Check if we need to render unconditionally in portal (no, we can just portal the AnimatePresence, but AnimatePresence needs to be inside the portal for exit animations to work correctly)
// Wait, actually AnimatePresence inside a portal works perfectly!

// Let's write the whole block to be safe.
const newBlock = `{typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && rect && (
            <motion.span
              ref={popupRef}
              initial={{ opacity: 0, scale: 0.5, rotateX: 90, y: -20, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.5, rotateX: -90, y: -20, x: "-50%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: rect.bottom + 8,
                left: rect.left + rect.width / 2,
                zIndex: 999999
              }}
              className="w-max max-w-[280px] max-h-[350px] overflow-y-auto bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-5 flex flex-col gap-2 text-left font-sans text-base whitespace-normal origin-top"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2">
                  <strong className="text-xl font-serif text-theme-primary leading-none">{card.kanji || card.reading}</strong>
                  <button 
                    onClick={(e) => playAudio(e, text)}
                    className="p-1.5 bg-theme-accent/10 rounded-full text-theme-accent hover:bg-theme-accent/20 transition-colors shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {onEditCard && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsOpen(false); if (onEditCard) onEditCard(card); window.dispatchEvent(new CustomEvent('editCard', { detail: card })); }}
                      className="p-1.5 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 ml-1"
                      title="Chỉnh sửa từ vựng"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </span>
                {card.sinoVietnamese && <span className="text-[10px] font-bold text-white bg-theme-accent px-2 py-0.5 rounded-full uppercase tracking-wider mb-0.5 whitespace-nowrap shadow-sm">{card.sinoVietnamese}</span>}
              </span>
              
              {card.reading && card.kanji && (
                <span className="text-sm font-medium text-theme-primary/80 bg-theme-primary/5 px-2 py-1 rounded inline-block w-fit">{card.reading} {card.romaji ? \`(\${card.romaji})\` : ''}</span>
              )}
              <span className="text-base text-theme-primary mt-1 border-t border-theme-subtle/50 pt-2">{card.meaning}</span>
              {(card.wordType || card.kanjiExplanation) && (
                 <span className="text-sm text-theme-primary mt-1 border-t border-theme-subtle/50 pt-2 flex flex-col gap-1.5">
                   {card.wordType && <span className="font-semibold text-theme-accent bg-theme-accent/10 px-2 py-1 rounded w-fit text-xs">Loại từ: {card.wordType}</span>}
                   {card.kanjiExplanation && <span className="opacity-90 italic whitespace-pre-wrap leading-relaxed">{card.kanjiExplanation}</span>}
                 </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>,
        document.body
      )}`;

content = content.replace(
  /\{typeof document !== 'undefined' && createPortal\([\s\S]*?,\s*document\.body\s*\)\}/,
  newBlock
);

// if not found by the typeof replacement, it means it's still the old one
if (!content.includes("{typeof document !== 'undefined' && createPortal(")) {
  content = content.replace(
    /<AnimatePresence>[\s\S]*?<\/AnimatePresence>/,
    newBlock
  );
}

fs.writeFileSync('src/utils/highlight.tsx', content);

