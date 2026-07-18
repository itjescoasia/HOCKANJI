const fs = require('fs');
let file = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const importStatement = "import Markdown from 'react-markdown';\n";
if (!file.includes('react-markdown')) {
  file = importStatement + file;
}

const oldLogic = `{currentCard.kanjiExplanation && (
                  <div className="mt-4 px-6 py-4 bg-theme-hover/50 border border-theme-subtle rounded text-sm sm:text-base text-theme-primary font-sans opacity-90 leading-relaxed text-center max-w-lg mx-auto whitespace-pre-wrap">
                    {currentCard.kanjiExplanation}
                  </div>
                )}`;

const newLogic = `{currentCard.kanjiExplanation && (
                  <div className="mt-4 px-6 py-4 bg-theme-hover/50 border border-theme-subtle rounded text-sm sm:text-base text-theme-primary font-sans opacity-90 leading-relaxed text-center max-w-lg mx-auto whitespace-pre-wrap markdown-body">
                    <Markdown>{currentCard.kanjiExplanation}</Markdown>
                  </div>
                )}`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/ReviewSession.tsx', file);
console.log('Patched ReviewSession');
