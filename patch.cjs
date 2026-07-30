const fs = require('fs');
const file = 'src/components/ConversationView.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<p className="text-theme-primary font-serif text-lg">{result.dialogue.japanese}</p>
                              <p className="text-theme-primary/60 text-sm mt-1">{result.dialogue.vietnamese}</p>`;
const replacement = `<p className="text-theme-primary font-serif text-lg">{result.dialogue.japanese}</p>
                              {(result.dialogue.hiragana || result.dialogue.romaji) && (
                                <p className="text-theme-primary/50 text-xs font-medium mt-1">
                                  {result.dialogue.hiragana} {result.dialogue.hiragana && result.dialogue.romaji && '•'} {result.dialogue.romaji}
                                </p>
                              )}
                              <p className="text-theme-primary/60 text-sm mt-1">{result.dialogue.vietnamese}</p>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched successfully");
} else {
  console.log("Target not found!");
}
