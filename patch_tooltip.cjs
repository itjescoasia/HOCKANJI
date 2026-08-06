const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target = `            <motion.span
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
            </motion.span>`;

const newTooltip = `            <motion.span
              ref={popupRef}
              initial={{ opacity: 0, y: -5, scale: 0.95, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: -5, scale: 0.95, x: "-50%" }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: 'fixed',
                top: rect.bottom + 12,
                left: rect.left + rect.width / 2,
                zIndex: 999999
              }}
              className="w-max max-w-[320px] max-h-[400px] overflow-y-auto bg-theme-panel border border-theme-subtle rounded-xl shadow-xl p-4 flex flex-col gap-3 text-left font-sans text-base whitespace-normal"
            >
              {/* Arrow */}
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-theme-panel border-t border-l border-theme-subtle rotate-45 rounded-sm" />
              
              <span className="flex items-start justify-between gap-4 relative z-10">
                <span className="flex flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-2xl font-serif text-theme-primary leading-none">{card.kanji || card.reading}</strong>
                    {card.sinoVietnamese && <span className="text-[10px] font-bold text-theme-inverted bg-theme-accent px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">{card.sinoVietnamese}</span>}
                  </span>
                  {card.reading && card.kanji && (
                    <span className="text-sm font-medium text-theme-primary/70">{card.reading} {card.romaji ? \`(\${card.romaji})\` : ''}</span>
                  )}
                </span>
                <span className="flex items-center gap-1 -mt-1 -mr-1">
                  <button 
                    onClick={(e) => playAudio(e, text)}
                    className="p-2 rounded-full text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10 transition-colors shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {onEditCard && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsOpen(false); if (onEditCard) onEditCard(card); window.dispatchEvent(new CustomEvent('editCard', { detail: card })); }}
                      className="p-2 rounded-full text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10 transition-colors shrink-0"
                      title="Chỉnh sửa từ vựng"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </span>
              </span>
              
              <span className="w-full h-px bg-theme-subtle/50 relative z-10" />
              
              <span className="text-base text-theme-primary leading-relaxed relative z-10">
                {card.meaning}
              </span>
              
              {(card.wordType || card.kanjiExplanation) && (
                 <span className="flex flex-col gap-2 relative z-10 mt-1">
                   {card.wordType && <span className="text-[11px] font-bold text-theme-primary/50 uppercase tracking-widest">{card.wordType}</span>}
                   {card.kanjiExplanation && <span className="text-sm text-theme-primary/80 italic leading-relaxed">{card.kanjiExplanation}</span>}
                 </span>
              )}
            </motion.span>`;

content = content.replace(target, newTooltip);
fs.writeFileSync('src/utils/highlight.tsx', content);
console.log("Patched tooltip popup");
