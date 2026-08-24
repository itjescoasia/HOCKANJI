const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const target = `                          <button
                            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                            className="absolute top-4 right-4 p-2.5 text-theme-primary/40 hover:text-theme-accent bg-theme-panel/80 hover:bg-theme-panel rounded-full transition-colors opacity-0 group-hover/ex:opacity-100 shadow-sm"
                            title="Nghe phát âm"
                          >`;

const replacement = `                          <button
                            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                            className={` + "`absolute top-4 right-4 p-2.5 rounded-full transition-colors shadow-sm ${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10' : 'text-theme-primary/40 hover:text-theme-accent bg-theme-panel/80 hover:bg-theme-panel'}`" + `}
                            title="Nghe phát âm"
                          >`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/VocabList.tsx', code);
