const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const t1 = `<button
                    type="button"
                    onClick={(e) => handleTTS(currentExample.sentence, e)}
                    className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors"
                    title="Phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>`;

const r1 = `<div className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => handleTTS(currentExample.sentence, e)}
                    className={\`p-2 rounded-full transition-colors \${currentExample.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10'}\`}
                    title={currentExample.audioUrl ? "Nghe file MP3" : "Phát âm"}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  {currentExample.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
                  </div>`;

// Since there are multiple occurrences of t1, we can use a global replace
code = code.split(t1).join(r1);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
