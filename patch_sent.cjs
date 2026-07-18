const fs = require('fs');
let file = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const importStatement = "import Markdown from 'react-markdown';\n";
if (!file.includes('react-markdown')) {
  file = importStatement + file;
}

const oldLogic = `<div className="relative z-10 text-[15px] text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                  {currentExample.specialNote}
                </div>`;

const newLogic = `<div className="relative z-10 text-[15px] text-theme-primary/80 leading-relaxed font-serif markdown-body">
                  <Markdown>{currentExample.specialNote}</Markdown>
                </div>`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/SentenceReview.tsx', file);
console.log('Patched SentenceReview');
