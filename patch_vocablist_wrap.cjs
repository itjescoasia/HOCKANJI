const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const target = `                            {(ex.reading || ex.romaji) && (
                              <div className="flex gap-3 text-sm opacity-60 italic mt-1">
                                {ex.reading && <span>{ex.reading}</span>}
                                {ex.romaji && <span className="font-mono">[{ex.romaji}]</span>}
                              </div>
                            )}`;

const replacement = `                            {(ex.reading || ex.romaji) && (
                              <div className="text-sm opacity-60 italic mt-1 leading-relaxed">
                                {ex.reading && <span className="mr-3 inline-block">{ex.reading}</span>}
                                {ex.romaji && <span className="font-mono inline-block">[{ex.romaji}]</span>}
                              </div>
                            )}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/VocabList.tsx', code);
