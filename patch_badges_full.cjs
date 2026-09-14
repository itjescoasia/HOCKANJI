const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const t1 = `<button
                                      onClick={(e) => playAudio(e, card.example!, card.audioUrl)}
                                      className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-100 shrink-0 -mt-0.5"
                                      title="Nghe câu ví dụ"
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>`;

const r1 = `<div className="flex flex-col items-center gap-0.5 shrink-0 -mt-0.5">
                                    <button
                                      onClick={(e) => playAudio(e, card.example!, card.audioUrl)}
                                      className={\`p-1.5 rounded-full transition-colors opacity-100 \${card.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'}\`}
                                      title={card.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                    {card.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
                                    </div>`;

code = code.replace(t1, r1);

fs.writeFileSync('src/components/VocabList.tsx', code);
