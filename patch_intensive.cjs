const fs = require('fs');
let file = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const importStatement = "import Markdown from 'react-markdown';\n";
if (!file.includes('react-markdown')) {
  file = importStatement + file;
}

const oldLogicExp = `<p className="text-theme-primary opacity-80 mt-6 leading-relaxed max-w-2xl">{word.explanation}</p>`;
const newLogicExp = `<div className="text-theme-primary opacity-80 mt-6 leading-relaxed max-w-2xl markdown-body text-left"><Markdown>{word.explanation}</Markdown></div>`;

const oldLogicNote = `<div className="text-sm text-theme-primary opacity-80 mt-3 p-3 bg-theme-base rounded border border-theme-subtle">
                                {ex.specialNote}
                              </div>`;
const newLogicNote = `<div className="text-sm text-theme-primary opacity-80 mt-3 p-3 bg-theme-base rounded border border-theme-subtle markdown-body">
                                <Markdown>{ex.specialNote}</Markdown>
                              </div>`;

file = file.replace(oldLogicExp, newLogicExp);
file = file.replace(oldLogicNote, newLogicNote);
fs.writeFileSync('src/components/IntensiveStudy.tsx', file);
console.log('Patched IntensiveStudy');
