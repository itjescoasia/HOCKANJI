const fs = require('fs');

let code1 = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const t1 = `{!ex.hasAudio && !ex.audioUrl && (
                                    <div className="inline-flex flex-col items-center ml-3 gap-0.5 align-middle">
                                    <button
                                      onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                                      className={\`inline-flex items-center justify-center p-2 transition-colors rounded-full \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10'}\`}
                                      title={ex.audioUrl ? "Nghe file MP3" : "Nghe câu ví dụ"}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                    {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-0.5">MP3</span>}
                                    </div>
                                    )}`;

const r1 = `{!ex.hasAudio && !ex.audioUrl && (
                                    <span className="inline-flex flex-col items-center ml-3 gap-0.5 align-middle">
                                    <button
                                      onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                                      className={\`inline-flex items-center justify-center p-2 transition-colors rounded-full \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10'}\`}
                                      title={ex.audioUrl ? "Nghe file MP3" : "Nghe câu ví dụ"}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                    {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-0.5">MP3</span>}
                                    </span>
                                    )}`;

code1 = code1.replace(t1, r1);
fs.writeFileSync('src/components/IntensiveStudy.tsx', code1);

