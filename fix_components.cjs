const fs = require('fs');

function wrap(file, oldStr, newStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(file, content);
}

// ConversationView.tsx
let cv = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');
cv = cv.replace('import { renderExampleHighlight, tokenizeExampleText, RelatedHighlight } from "../utils/highlight";', 'import { renderExampleHighlight, tokenizeExampleText, RelatedHighlight, HighlightProvider } from "../utils/highlight";');
cv = cv.replace('<div className="flex-1 space-y-1">', '<HighlightProvider><div className="flex-1 space-y-1">');
cv = cv.replace(/\{dialogue\.vietnamese \&\& \(\r?\n\s*<p className="text-base text-theme-primary\/70 mt-2">\r?\n\s*\{dialogue\.vietnamese\}\r?\n\s*<\/p>\r?\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>/, 
`{dialogue.vietnamese && (
                                    <p className="text-base text-theme-primary/70 mt-2">
                                      {dialogue.vietnamese}
                                    </p>
                                  )}
                                </div></HighlightProvider>
                              </div>`);
                              
cv = cv.replace('<div className="space-y-6 max-w-2xl mx-auto w-full text-center mt-6">', '<HighlightProvider><div className="space-y-6 max-w-2xl mx-auto w-full text-center mt-6">');
cv = cv.replace(/<p className="text-xl text-theme-primary\/80 mt-6 leading-relaxed max-w-2xl mx-auto">\r?\n\s*\{conversation\.dialogues\[currentSlideIndex\]\.vietnamese\}\r?\n\s*<\/p>/,
`<p className="text-xl text-theme-primary/80 mt-6 leading-relaxed max-w-2xl mx-auto">
                    {conversation.dialogues[currentSlideIndex].vietnamese}
                  </p></HighlightProvider>`);
fs.writeFileSync('src/components/ConversationView.tsx', cv);

console.log("Updated ConversationView.tsx");

