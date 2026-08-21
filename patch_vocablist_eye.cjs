const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// 1. Add state
code = code.replace(
  "const [editingId, setEditingId] = useState<string | null>(null);",
  "const [editingId, setEditingId] = useState<string | null>(null);\n  const [viewingCard, setViewingCard] = useState<KanjiCard | null>(null);"
);

// 2. Add button in table row
const actionButtonsStr = `                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <button 
                          onClick={() => startEdit(card)}`;
const newActionButtonsStr = `                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <button 
                          onClick={() => setViewingCard(card)}
                          className="p-2 text-[#555] hover:text-blue-500 transition-colors inline-flex items-center justify-center opacity-70 hover:opacity-100 mr-1"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => startEdit(card)}`;
code = code.replace(actionButtonsStr, newActionButtonsStr);

// 3. Add Modal Component at the end of return statement
const returnEndStr = `          </div>
        </div>
      </div>
    </div>
  );
}`;
const modalCode = `
      {viewingCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-theme-base w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col relative custom-scrollbar">
            {/* Header / Main Vocab */}
            <div className="sticky top-0 bg-theme-panel/95 backdrop-blur z-10 border-b border-theme-subtle px-6 py-4 flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-4xl md:text-5xl font-serif text-theme-accent">{viewingCard.kanji || viewingCard.reading}</h2>
                  <button
                    onClick={(e) => playAudio(e, viewingCard.kanji || viewingCard.reading, viewingCard.audioUrl)}
                    className="p-2 bg-theme-accent/10 text-theme-accent rounded-full hover:bg-theme-accent hover:text-theme-inverted transition-colors"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {viewingCard.kanji && viewingCard.reading && viewingCard.kanji !== viewingCard.reading && (
                    <span className="text-lg text-theme-primary opacity-80">{viewingCard.reading}</span>
                  )}
                  {viewingCard.romaji && (
                    <span className="text-sm font-mono text-theme-primary opacity-60">[{viewingCard.romaji}]</span>
                  )}
                  {viewingCard.sinoVietnamese && (
                    <span className="text-xs uppercase tracking-widest bg-theme-accent/10 text-theme-accent px-2 py-1 rounded-sm border border-theme-accent/20">
                      {viewingCard.sinoVietnamese}
                    </span>
                  )}
                  {viewingCard.wordType && (
                    <span className={getWordTypeBadgeStyle(viewingCard.wordType, "text-xs px-2 py-1")}>{viewingCard.wordType}</span>
                  )}
                </div>
                <div className="text-xl text-theme-primary font-medium mt-3 uppercase tracking-wide">
                  {viewingCard.meaning}
                </div>
              </div>
              <button 
                onClick={() => setViewingCard(null)}
                className="p-2 text-theme-primary/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col gap-8">
              
              {/* Kanji Explanation */}
              {viewingCard.kanjiExplanation && (
                <div className="bg-theme-base-alt rounded-md p-5 border border-theme-subtle">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-4 border-b border-theme-subtle pb-2">
                    Giải thích Hán tự
                  </h3>
                  <div className="markdown-body text-sm leading-relaxed opacity-90">
                    <Markdown>{cleanMarkdownForDisplay(viewingCard.kanjiExplanation)}</Markdown>
                  </div>
                </div>
              )}

              {/* Forms / Conjugation */}
              {viewingCard.forms && viewingCard.forms.length > 0 && (
                <div className="bg-theme-base-alt rounded-md p-5 border border-theme-subtle">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-4 border-b border-theme-subtle pb-2">
                    Các thể / Chia thì
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {viewingCard.forms.map((f, idx) => (
                      <div key={idx} className="bg-theme-hover p-3 rounded-sm border border-theme-subtle/50 flex flex-col gap-1">
                        <div className="text-xs uppercase tracking-wider text-theme-accent/70 mb-1">{f.name}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-serif text-theme-primary">{f.value}</span>
                          <button
                            onClick={(e) => playAudio(e, f.value)}
                            className="text-theme-primary/40 hover:text-theme-accent transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {(f.reading || f.romaji) && (
                          <div className="text-[10px] text-theme-primary/60 mt-1 flex justify-between">
                            <span>{f.reading}</span>
                            <span className="font-mono">{f.romaji}</span>
                          </div>
                        )}
                        {f.meaning && (
                          <div className="text-[11px] text-theme-primary/80 italic mt-1 border-t border-theme-subtle/30 pt-1">
                            {f.meaning}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {(viewingCard.examples && viewingCard.examples.length > 0) || (viewingCard.example || viewingCard.exampleTranslation) ? (
                <div className="bg-theme-base-alt rounded-md p-5 border border-theme-subtle">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-4 border-b border-theme-subtle pb-2">
                    Các câu ví dụ
                  </h3>
                  <div className="flex flex-col gap-4">
                    {viewingCard.examples && viewingCard.examples.length > 0 ? (
                      viewingCard.examples.map((ex, idx) => (
                        <div key={idx} className="bg-theme-hover p-4 rounded-sm border-l-2 border-theme-accent relative group/ex">
                          <div className="pr-8 text-base text-theme-primary mb-2 flex flex-col gap-1">
                            <span className="font-serif">
                              <HighlightProvider>
                                {renderExampleHighlight(ex.sentence, viewingCard.kanji || viewingCard.reading, [], viewingCard)}
                              </HighlightProvider>
                            </span>
                            {(ex.reading || ex.romaji) && (
                              <div className="flex gap-2 text-xs opacity-60 italic">
                                {ex.reading && <span>{ex.reading}</span>}
                                {ex.romaji && <span>[{ex.romaji}]</span>}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-theme-accent/80 italic border-t border-theme-subtle/50 pt-2">
                            <HighlightProvider>
                              <HighlightVietnamese text={ex.translation || ""} />
                            </HighlightProvider>
                          </div>
                          <button
                            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                            className="absolute top-4 right-4 p-2 text-theme-primary/40 hover:text-theme-accent bg-theme-panel/50 rounded-full transition-colors opacity-0 group-hover/ex:opacity-100"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="bg-theme-hover p-4 rounded-sm border-l-2 border-theme-accent relative group/ex">
                        <div className="pr-8 text-base text-theme-primary mb-2 font-serif">
                          <HighlightProvider>
                            {renderExampleHighlight(viewingCard.example!, viewingCard.kanji || viewingCard.reading, [], viewingCard)}
                          </HighlightProvider>
                        </div>
                        {viewingCard.exampleTranslation && (
                          <div className="text-sm text-theme-accent/80 italic border-t border-theme-subtle/50 pt-2">
                            <HighlightProvider>
                              <HighlightVietnamese text={viewingCard.exampleTranslation} />
                            </HighlightProvider>
                          </div>
                        )}
                        <button
                          onClick={(e) => playAudio(e, viewingCard.example!, viewingCard.audioUrl)}
                          className="absolute top-4 right-4 p-2 text-theme-primary/40 hover:text-theme-accent bg-theme-panel/50 rounded-full transition-colors opacity-0 group-hover/ex:opacity-100"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}`;

code = code.replace(returnEndStr, modalCode);

fs.writeFileSync('src/components/VocabList.tsx', code);
