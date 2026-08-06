const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const targetExamples = `                    {currentCard.examples.map((ex, index) => (
                      <HighlightProvider key={ex.id}><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        <div className="w-full flex items-start gap-2 justify-between">
                          <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                            {renderExampleHighlight(ex.sentence, currentCard.kanji || currentCard.reading, deck || [], currentCard)}
                          </p>
                          <button
                            onClick={(e) => handleSpeak(e, ex.sentence)}
                            className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-0 group-hover/ex:opacity-100 shrink-0 -mt-1"
                            title="Nghe câu ví dụ"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                        {(ex.reading || ex.romaji) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-theme-primary/60 font-serif w-full">
                            {ex.reading && <span className="opacity-80 italic"><RelatedHighlight text={ex.reading} type="hiragana" /></span>}
                            {ex.romaji && <span className="opacity-60 italic"><RelatedHighlight text={ex.romaji} type="romaji" /></span>}
                          </div>
                        )}
                        {ex.translation && (
                          <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                            <HighlightVietnamese text={ex.translation} />
                          </p>
                        )}
                      </div></HighlightProvider>
                    ))}`;

const newExamples = `                    {currentCard.examples.map((ex, index) => {
                      const isEditingExample = editingExampleId === ex.id;
                      return (
                      <HighlightProvider key={ex.id}><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        {isEditingExample ? (
                          <div className="w-full flex flex-col gap-3">
                            <input
                              type="text"
                              value={editExampleForm.sentence}
                              onChange={e => setEditExampleForm({...editExampleForm, sentence: e.target.value})}
                              className="w-full bg-theme-panel border border-theme-subtle rounded p-2 text-theme-primary focus:outline-none focus:border-theme-accent"
                              placeholder="Câu tiếng Nhật..."
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editExampleForm.reading || ''}
                                onChange={e => setEditExampleForm({...editExampleForm, reading: e.target.value})}
                                className="w-1/2 bg-theme-panel border border-theme-subtle rounded p-2 text-theme-primary focus:outline-none focus:border-theme-accent"
                                placeholder="Cách đọc (Hiragana)..."
                              />
                              <input
                                type="text"
                                value={editExampleForm.romaji || ''}
                                onChange={e => setEditExampleForm({...editExampleForm, romaji: e.target.value})}
                                className="w-1/2 bg-theme-panel border border-theme-subtle rounded p-2 text-theme-primary focus:outline-none focus:border-theme-accent"
                                placeholder="Romaji..."
                              />
                            </div>
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
                                  const updatedExamples = currentCard.examples!.map(e => 
                                    e.id === ex.id ? { ...e, ...editExampleForm } : e
                                  );
                                  onUpdateCard(currentCard.id, { examples: updatedExamples });
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
                            <div className="w-full flex items-start gap-2 justify-between">
                              <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                                {renderExampleHighlight(ex.sentence, currentCard.kanji || currentCard.reading, deck || [], currentCard)}
                              </p>
                              <div className="flex items-center opacity-0 group-hover/ex:opacity-100 transition-opacity shrink-0 -mt-1 gap-1">
                                <button
                                  onClick={() => {
                                    setEditingExampleId(ex.id);
                                    setEditExampleForm({
                                      sentence: ex.sentence,
                                      translation: ex.translation || "",
                                      reading: ex.reading || "",
                                      romaji: ex.romaji || ""
                                    });
                                  }}
                                  className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors"
                                  title="Sửa câu ví dụ"
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={(e) => handleSpeak(e, ex.sentence)}
                                  className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors"
                                  title="Nghe câu ví dụ"
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                            {(ex.reading || ex.romaji) && (
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-theme-primary/60 font-serif w-full">
                                {ex.reading && <span className="opacity-80 italic"><RelatedHighlight text={ex.reading} type="hiragana" /></span>}
                                {ex.romaji && <span className="opacity-60 italic"><RelatedHighlight text={ex.romaji} type="romaji" /></span>}
                              </div>
                            )}
                            {ex.translation && (
                              <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                                <HighlightVietnamese text={ex.translation} />
                              </p>
                            )}
                          </>
                        )}
                      </div></HighlightProvider>
                      );
                    })}`;

content = content.replace(targetExamples, newExamples);
fs.writeFileSync('src/components/ReviewSession.tsx', content);
console.log("Patched ReviewSession multiple examples");
