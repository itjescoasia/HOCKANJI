const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace('import { renderExampleHighlight, RelatedHighlight } from "../utils/highlight";', 'import { renderExampleHighlight, RelatedHighlight, HighlightProvider } from "../utils/highlight";');
code = code.replace(/<div className="flex-1 w-full flex flex-col justify-center max-w-4xl mx-auto px-4 sm:px-12 py-12">/, '<div className="flex-1 w-full flex flex-col justify-center max-w-4xl mx-auto px-4 sm:px-12 py-12">\n                <HighlightProvider>');

code = code.replace(/\{currentExample\.specialNote\}\r?\n\s*<\/p>\r?\n\s*<\/div>\r?\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*<div className="mt-8 flex gap-4 w-full">/, `{currentExample.specialNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </HighlightProvider>

                  <div className="mt-8 flex gap-4 w-full">`);

code = code.replace(
`                    {mode === "VI_TO_JA" && currentExample.reading && (
                      <p className="text-theme-primary/60 mt-4 text-sm">
                        {currentExample.reading}
                      </p>
                    )}`,
`                    {mode === "VI_TO_JA" && currentExample.reading && (
                      <p className="text-theme-primary/60 mt-4 text-sm">
                        <RelatedHighlight text={currentExample.reading} type="hiragana" />
                      </p>
                    )}`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
console.log("Updated SentenceReview.tsx");
