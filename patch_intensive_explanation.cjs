const fs = require('fs');
let file = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const oldLogic = `<div className="text-theme-primary/90 text-sm sm:text-base leading-relaxed bg-theme-hover/50 p-5 rounded-lg border border-theme-subtle border-l-4 border-l-[#c5a059] mt-3 shadow-inner max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="whitespace-pre-wrap font-sans">
                    {word.explanation}
                  </div>
                </div>`;

const newLogic = `<div className="text-theme-primary/90 text-sm sm:text-base leading-relaxed bg-theme-hover/50 p-5 rounded-lg border border-theme-subtle border-l-4 border-l-[#c5a059] mt-3 shadow-inner max-h-64 overflow-y-auto custom-scrollbar markdown-body">
                  <Markdown>{word.explanation}</Markdown>
                </div>`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/IntensiveStudy.tsx', file);
console.log('Patched IntensiveStudy explanation');
