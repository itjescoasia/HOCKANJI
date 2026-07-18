const fs = require('fs');
let file = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const importStatement = "import Markdown from 'react-markdown';\n";
if (!file.includes('react-markdown')) {
  file = importStatement + file;
}

const oldLogicExp = `{card.kanjiExplanation && (
                          <div className="mt-2 text-xs text-theme-primary font-sans opacity-80 whitespace-pre-wrap leading-relaxed w-full sm:min-w-[300px] lg:min-w-[500px]">
                            {card.kanjiExplanation}
                          </div>
                        )}`;
const newLogicExp = `{card.kanjiExplanation && (
                          <div className="mt-2 text-xs text-theme-primary font-sans opacity-80 leading-relaxed w-full sm:min-w-[300px] lg:min-w-[500px] markdown-body">
                            <Markdown>{card.kanjiExplanation}</Markdown>
                          </div>
                        )}`;

file = file.replace(oldLogicExp, newLogicExp);
fs.writeFileSync('src/components/VocabList.tsx', file);
console.log('Patched VocabList');
