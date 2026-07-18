const fs = require('fs');
let file = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const importStatement = "import Markdown from 'react-markdown';\n";
if (!file.includes('react-markdown')) {
  file = importStatement + file;
}

const oldLogicExp1 = `<div className="relative z-10 text-[15px] text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                                        {dialogue.explanation}
                                      </div>`;

const newLogicExp1 = `<div className="relative z-10 text-[15px] text-theme-primary/80 leading-relaxed font-serif markdown-body">
                                        <Markdown>{dialogue.explanation}</Markdown>
                                      </div>`;

const oldLogicExp2 = `<div className="relative z-10 text-base md:text-lg text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                      {conversation.dialogues[currentSlideIndex].explanation}
                    </div>`;

const newLogicExp2 = `<div className="relative z-10 text-base md:text-lg text-theme-primary/80 leading-relaxed font-serif markdown-body">
                      <Markdown>{conversation.dialogues[currentSlideIndex].explanation}</Markdown>
                    </div>`;

file = file.replace(oldLogicExp1, newLogicExp1);
file = file.replace(oldLogicExp2, newLogicExp2);
fs.writeFileSync('src/components/ConversationView.tsx', file);
console.log('Patched ConversationView');
