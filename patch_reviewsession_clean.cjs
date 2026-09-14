const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const target1 = `                  <button 
                    onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
                    className="p-3 text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors rounded-full transition-transform active:scale-95"
                    title="Phát âm"
                  >
                    <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 font-light" strokeWidth={1.5} />
                  </button>`;

const rep1 = `<div className="flex flex-col items-center gap-0.5">
                  <button 
                    onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
                    className={\`p-3 rounded-full transition-transform active:scale-95 \${currentCard.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors'}\`}
                    title={currentCard.audioUrl ? "Nghe file MP3" : "Phát âm"}
                  >
                    <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 font-light" strokeWidth={1.5} />
                  </button>
                  {currentCard.audioUrl && <span className="text-[10px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-1">MP3</span>}
                  </div>`;

code = code.replace(target1, rep1);

const target2 = `                  <button 
                    onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
                    className="p-2 text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors rounded-full transition-transform active:scale-95"
                    title="Phát âm"
                  >
                    <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 font-light" strokeWidth={1.5} />
                  </button>`;

const rep2 = `<div className="flex flex-col items-center gap-0.5">
                  <button 
                    onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
                    className={\`p-2 rounded-full transition-transform active:scale-95 \${currentCard.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors'}\`}
                    title={currentCard.audioUrl ? "Nghe file MP3" : "Phát âm"}
                  >
                    <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 font-light" strokeWidth={1.5} />
                  </button>
                  {currentCard.audioUrl && <span className="text-[9px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-1">MP3</span>}
                  </div>`;

code = code.replace(target2, rep2);

const target3 = `<button
                                  onClick={(e) => handleSpeak(e, ex.sentence, ex.audioUrl)}
                                  className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors"
                                  title="Nghe câu ví dụ"
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>`;

const rep3 = `<div className="flex flex-col items-center gap-0.5">
                                <button
                                  onClick={(e) => handleSpeak(e, ex.sentence, ex.audioUrl)}
                                  className={\`p-2 rounded-full transition-colors \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent'}\`}
                                  title={ex.audioUrl ? "Nghe file MP3" : "Nghe câu ví dụ"}
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>
                                {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
                                </div>`;

code = code.replace(target3, rep3);

const target4 = `<button
                                    onClick={(e) => handleSpeak(e, currentCard.example!, currentCard.audioUrl)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors"
                                    title="Nghe câu ví dụ"
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>`;

const rep4 = `<div className="flex flex-col items-center gap-0.5">
                                  <button
                                    onClick={(e) => handleSpeak(e, currentCard.example!, currentCard.audioUrl)}
                                    className={\`p-2 rounded-full transition-colors \${currentCard.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent'}\`}
                                    title={currentCard.audioUrl ? "Nghe file MP3" : "Nghe câu ví dụ"}
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                  {currentCard.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
                                  </div>`;
code = code.replace(target4, rep4);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
