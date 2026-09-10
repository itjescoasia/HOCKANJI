const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

code = code.replace(
  /if \(currentCard\.reading \|\| currentCard\.kanji\) {\n\s*const utterance = new SpeechSynthesisUtterance\(currentCard\.reading \|\| currentCard\.kanji!\);\n\s*utterance\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(utterance\);\n\s*}/g,
  "playTTS(currentCard.reading || currentCard.kanji!);"
);

fs.writeFileSync('src/components/ConversationView.tsx', code);
