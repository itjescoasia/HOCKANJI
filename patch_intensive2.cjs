const fs = require('fs');
let file = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const oldLogic = `<div className="relative z-10 text-[15px] text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                                            {ex.specialNote}
                                          </div>`;

const newLogic = `<div className="relative z-10 text-[15px] text-theme-primary/80 leading-relaxed font-serif markdown-body">
                                            <Markdown>{ex.specialNote}</Markdown>
                                          </div>`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/IntensiveStudy.tsx', file);
console.log('Patched IntensiveStudy');
