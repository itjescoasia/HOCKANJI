const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const targetLegacy = `                  (currentCard.example || currentCard.exampleTranslation) && (
                    <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                      <HighlightProvider><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        {currentCard.example && (
                          <div className="w-full flex items-start gap-2 justify-between">
                            <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                              {renderExampleHighlight(currentCard.example, currentCard.kanji || currentCard.reading, deck || [], currentCard)}
                            </p>
                            <button
                              onClick={(e) => handleSpeak(e, currentCard.example!)}
                              className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-0 group-hover/ex:opacity-100 shrink-0 -mt-1"
                              title="Nghe câu ví dụ"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {currentCard.exampleTranslation && (
                          <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                            <HighlightVietnamese text={currentCard.exampleTranslation} />
                          </p>
                        )}
                      </div></HighlightProvider>
                    </div>
                  )`;

const newLegacy = `                  (currentCard.example || currentCard.exampleTranslation) && (
                    <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                      <HighlightProvider><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        {editingExampleId === 'legacy' ? (
                          <div className="w-full flex flex-col gap-3">
                            <input
                              type="text"
                              value={editExampleForm.sentence}
                              onChange={e => setEditExampleForm({...editExampleForm, sentence: e.target.value})}
                              className="w-full bg-theme-panel border border-theme-subtle rounded p-2 text-theme-primary focus:outline-none focus:border-theme-accent"
                              placeholder="Câu tiếng Nhật..."
                            />
                            <textarea
                              value={editExampleForm.translation || ''}
                              onChange={e => setEditExampleForm({...editExampleForm, translation: e.target.value})}
                              className="w-full bg-theme-panel border border-theme-subtle rounded p-2 text-theme-primary focus:outline-none focus:border-theme-accent"
                              placeholder="Nghĩa tiếng Việt..."
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setEditingExampleId(null)}
                                className="px-3 py-1.5 text-sm text-theme-primary/60 hover:text-theme-primary"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => {
                                  if (!onUpdateCard) return;
                                  onUpdateCard(currentCard.id, { 
                                    example: editExampleForm.sentence,
                                    exampleTranslation: editExampleForm.translation
                                  });
                                  setEditingExampleId(null);
                                }}
                                className="px-3 py-1.5 text-sm bg-theme-accent text-white rounded hover:bg-opacity-90"
                              >
                                Lưu thay đổi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {currentCard.example && (
                              <div className="w-full flex items-start gap-2 justify-between">
                                <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                                  {renderExampleHighlight(currentCard.example, currentCard.kanji || currentCard.reading, deck || [], currentCard)}
                                </p>
                                <div className="flex items-center opacity-0 group-hover/ex:opacity-100 transition-opacity shrink-0 -mt-1 gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingExampleId('legacy');
                                      setEditExampleForm({
                                        sentence: currentCard.example || '',
                                        translation: currentCard.exampleTranslation || ''
                                      });
                                    }}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors"
                                    title="Sửa câu ví dụ"
                                  >
                                    <Edit3 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleSpeak(e, currentCard.example!)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors"
                                    title="Nghe câu ví dụ"
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            )}
                            {currentCard.exampleTranslation && (
                              <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                                <HighlightVietnamese text={currentCard.exampleTranslation} />
                              </p>
                            )}
                          </>
                        )}
                      </div></HighlightProvider>
                    </div>
                  )`;

content = content.replace(targetLegacy, newLegacy);
fs.writeFileSync('src/components/ReviewSession.tsx', content);
console.log("Patched ReviewSession legacy example");
