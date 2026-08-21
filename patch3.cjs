const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetStr = `                          <button
                            onClick={(e) => playAudio(e, f.value)}
                            className="p-1.5 bg-theme-base rounded-full text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>`;

const replacementStr = `                          <button
                            onClick={(e) => playAudio(e, f.value, f.audioUrl)}
                            className="p-1.5 bg-theme-base rounded-full text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel transition-colors"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/VocabList.tsx', code);
