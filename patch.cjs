const fs = require('fs');
const content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const target = `{currentCard.examples && currentCard.examples.length > 0 ? (
                  <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                    {currentCard.examples.map((ex, index) => (
                      <div key={ex.id} className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm">
                        <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                          {renderExampleWithHighlight(ex.sentence, currentCard.kanji, currentCard.reading)}
                        </p>
                        {(ex.reading || ex.romaji) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-theme-primary/60 font-serif w-full">
                            {ex.reading && <span>{ex.reading}</span>}
                            {ex.romaji && <span className="opacity-70">{ex.romaji}</span>}
                          </div>
                        )}
                        {ex.translation && (
                          <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                            {ex.translation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  (currentCard.example || currentCard.exampleTranslation) && (
                    <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                      <div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm">
                        {currentCard.example && (
                          <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                            {renderExampleWithHighlight(currentCard.example, currentCard.kanji, currentCard.reading)}
                          </p>
                        )}
                        {currentCard.exampleTranslation && (
                          <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                            {currentCard.exampleTranslation}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}`;

const replacement = `{currentCard.examples && currentCard.examples.length > 0 ? (
                  <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                    {currentCard.examples.map((ex, index) => (
                      <HighlightProvider key={ex.id}><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        <div className="w-full flex items-start gap-2 justify-between">
                          <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                            {renderExampleHighlight(ex.sentence, currentCard.kanji || currentCard.reading, [], currentCard)}
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
                    ))}
                  </div>
                ) : (
                  (currentCard.example || currentCard.exampleTranslation) && (
                    <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                      <HighlightProvider><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        {currentCard.example && (
                          <div className="w-full flex items-start gap-2 justify-between">
                            <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                              {renderExampleHighlight(currentCard.example, currentCard.kanji || currentCard.reading, [], currentCard)}
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
                  )
                )}`;

if (content.includes(target)) {
  fs.writeFileSync('src/components/ReviewSession.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
