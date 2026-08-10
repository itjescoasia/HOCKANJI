const fs = require('fs');
let content = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

if (!content.includes('Copy')) {
    content = content.replace('Volume2 } from "lucide-react";', 'Volume2, Copy } from "lucide-react";');
}

const viToJaAudioOrig = `{mode === "VI_TO_JA" && (
                <button
                  type="button"
                  onClick={(e) => handleTTS(currentExample.sentence, e)}
                  className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors mt-2"
                  title="Phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}`;

const copyBtn = `
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(currentExample.sentence);
                      const btn = e.currentTarget;
                      const originalHTML = btn.innerHTML;
                      btn.innerHTML = '<svg class="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                      setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
                    }}
                    className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors"
                    title="Copy câu tiếng Nhật"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
`;

const viToJaAudioNew = `{mode === "VI_TO_JA" && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={(e) => handleTTS(currentExample.sentence, e)}
                    className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors"
                    title="Phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  ${copyBtn}
                </div>
              )}`;

content = content.replace(viToJaAudioOrig, viToJaAudioNew);


const frontJaToViOrig = `{mode === "JA_TO_VI" && currentExample.reading && (
                <p className="text-theme-accent opacity-80 mt-4 text-sm">
                  <RelatedHighlight text={currentExample.reading} type="hiragana" />
                </p>
              )}`;

const frontJaToViNew = `{mode === "JA_TO_VI" && currentExample.reading && (
                <p className="text-theme-accent opacity-80 mt-4 text-sm">
                  <RelatedHighlight text={currentExample.reading} type="hiragana" />
                </p>
              )}
              {mode === "JA_TO_VI" && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={(e) => handleTTS(currentExample.sentence, e)}
                    className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors"
                    title="Phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  ${copyBtn}
                </div>
              )}`;

content = content.replace(frontJaToViOrig, frontJaToViNew);

const backJaToViOrig = `{currentExample.reading && (
                  <p className="text-theme-primary/80 text-sm">
                    <RelatedHighlight text={currentExample.reading} type="hiragana" />
                  </p>
                )}
              </div>
            )}`;

const backJaToViNew = `{currentExample.reading && (
                  <p className="text-theme-primary/80 text-sm">
                    <RelatedHighlight text={currentExample.reading} type="hiragana" />
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={(e) => handleTTS(currentExample.sentence, e)}
                    className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors"
                    title="Phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  ${copyBtn}
                </div>
              </div>
            )}`;

content = content.replace(backJaToViOrig, backJaToViNew);

fs.writeFileSync('src/components/SentenceReview.tsx', content);
console.log("Patched sentence review with copy button");
