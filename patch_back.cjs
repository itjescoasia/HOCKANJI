const fs = require('fs');
const file = 'src/components/SentenceReview.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `            <span className="text-xs font-mono text-theme-accent/30 mb-4 block uppercase">
              {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
            </span>`;

const newStr = `            {mode === "JA_TO_VI" && (
              <div className="mb-6 opacity-70">
                <p className="font-serif text-theme-japanese text-lg sm:text-xl mb-2">
                  {renderExampleHighlight(currentExample.sentence, currentExample.word, mainDeck)}
                </p>
                {currentExample.reading && (
                  <p className="text-theme-primary/80 text-sm">
                    <RelatedHighlight text={currentExample.reading} type="hiragana" />
                  </p>
                )}
              </div>
            )}
            {mode === "VI_TO_JA" && (
              <div className="mb-6 opacity-70">
                <p className="font-serif text-theme-primary text-lg sm:text-xl mb-2">
                  {currentExample.translation}
                </p>
              </div>
            )}
            <span className="text-xs font-mono text-theme-accent/30 mb-4 block uppercase">
              {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
            </span>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);
console.log("Patched back of card");
