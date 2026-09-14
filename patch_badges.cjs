const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const target1 = `<button
            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
            className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-100 shrink-0 -mt-0.5"
            title="Nghe câu ví dụ"
          >
            <Volume2 className="w-4 h-4" />
          </button>`;

const replacement1 = `<div className="flex flex-col items-center gap-0.5 shrink-0 -mt-0.5">
          <button
            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
            className={\`p-1.5 rounded-full transition-colors opacity-100 \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'}\`}
            title={ex.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
          </div>`;

code = code.replace(target1, replacement1);

const target2 = `<button
                            onClick={(e) => playAudio(e, f.value, f.audioUrl)}
                            className="p-1.5 bg-theme-base rounded-full text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel transition-colors"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>`;

const replacement2 = `<div className="flex flex-col items-center gap-0.5">
                          <button
                            onClick={(e) => playAudio(e, f.value, f.audioUrl)}
                            className={\`p-1.5 rounded-full transition-colors \${f.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel bg-theme-base'}\`}
                            title={f.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          {f.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
                          </div>`;

code = code.replace(target2, replacement2);

const target3 = `<button
                            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                            className={\`absolute top-4 right-4 p-2.5 rounded-full transition-colors shadow-sm \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10' : 'text-theme-primary/40 hover:text-theme-accent bg-theme-panel/80 hover:bg-theme-panel'}\`}
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>`;

const replacement3 = `<div className="absolute top-4 right-4 flex flex-col items-center gap-1">
                          <button
                            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                            className={\`p-2.5 rounded-full transition-colors shadow-sm \${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent bg-theme-panel/80 hover:bg-theme-panel'}\`}
                            title={ex.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                          {ex.audioUrl && <span className="text-[9px] font-bold text-theme-accent uppercase tracking-widest">MP3</span>}
                          </div>`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/VocabList.tsx', code);
