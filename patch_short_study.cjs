const fs = require('fs');
let code = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');

const t1 = `<button 
                  onClick={(e) => handleSpeak(e, word.kanji || word.reading, word.audioUrl)}
                  className="p-3 text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors rounded-full transition-transform active:scale-95"
                  title="Phát âm"
                >
                  <Volume2 className="w-8 h-8" />
                </button>`;
const r1 = `<div className="flex flex-col items-center gap-0.5">
                <button 
                  onClick={(e) => handleSpeak(e, word.kanji || word.reading, word.audioUrl)}
                  className={\`p-3 rounded-full transition-transform active:scale-95 \${word.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors'}\`}
                  title={word.audioUrl ? "Nghe file MP3" : "Phát âm"}
                >
                  <Volume2 className="w-8 h-8" />
                </button>
                {word.audioUrl && <span className="text-[10px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-1">MP3</span>}
                </div>`;
code = code.replace(t1, r1);

const t2 = `<button 
                     onClick={(e) => handleSpeak(e, word.kanji || word.reading, word.audioUrl)}
                     className="p-2 text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors rounded-full transition-transform active:scale-95"
                     title="Phát âm"
                   >
                     <Volume2 className="w-6 h-6" />
                   </button>`;
const r2 = `<div className="flex flex-col items-center gap-0.5">
                   <button 
                     onClick={(e) => handleSpeak(e, word.kanji || word.reading, word.audioUrl)}
                     className={\`p-2 rounded-full transition-transform active:scale-95 \${word.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors'}\`}
                     title={word.audioUrl ? "Nghe file MP3" : "Phát âm"}
                   >
                     <Volume2 className="w-6 h-6" />
                   </button>
                   {word.audioUrl && <span className="text-[9px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-1">MP3</span>}
                   </div>`;
code = code.replace(t2, r2);

fs.writeFileSync('src/components/ShortStudySession.tsx', code);
