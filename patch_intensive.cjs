const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const t1 = `<button
                onClick={(e) => playAudio(e, word.word || word.reading, word.audioUrl)}
                className="absolute -right-2 -bottom-2 p-2 bg-theme-panel text-theme-primary/50 hover:text-theme-accent border border-theme-subtle rounded-full shadow-md transition-all opacity-0 group-hover/speaker:opacity-100"
                title="Nghe phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>`;

const r1 = `<div className="absolute -right-2 -bottom-2 flex flex-col items-center gap-0.5 opacity-0 group-hover/speaker:opacity-100 transition-all">
              <button
                onClick={(e) => playAudio(e, word.word || word.reading, word.audioUrl)}
                className={\`p-2 border border-theme-subtle rounded-full shadow-md transition-colors \${word.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'bg-theme-panel text-theme-primary/50 hover:text-theme-accent hover:bg-theme-panel'}\`}
                title={word.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {word.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest bg-theme-panel px-1 rounded-sm">MP3</span>}
              </div>`;
code = code.replace(t1, r1);

const t2 = `<button
                                    onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title="Phát âm thanh"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>`;

const r2 = `<div className="flex flex-col items-center gap-0.5">
                                  <button
                                    onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                                    className={\`p-2 rounded transition-colors \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel'}\`}
                                    title={ex.audioUrl ? "Nghe file MP3" : "Phát âm thanh"}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                  {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-0.5">MP3</span>}
                                  </div>`;
code = code.replace(t2, r2);

const t3 = `<button
                                      onClick={(e) => playAudio(e, ex.sentence)}
                                      className="inline-flex items-center justify-center p-2 ml-3 text-theme-primary/40 hover:text-theme-accent transition-colors align-middle rounded-full hover:bg-theme-accent/10"
                                      title="Nghe câu ví dụ"
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>`;

const r3 = `<div className="inline-flex flex-col items-center ml-3 gap-0.5 align-middle">
                                    <button
                                      onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                                      className={\`inline-flex items-center justify-center p-2 transition-colors rounded-full \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10'}\`}
                                      title={ex.audioUrl ? "Nghe file MP3" : "Nghe câu ví dụ"}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                    {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-0.5">MP3</span>}
                                    </div>`;
code = code.replace(t3, r3);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
