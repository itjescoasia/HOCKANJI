const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

code = code.replace(
  /if \(currentCard\.kanji \|\| currentCard\.reading\) {\n\s*const utterance = new SpeechSynthesisUtterance\(currentCard\.kanji \|\| currentCard\.reading\);\n\s*utterance\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(utterance\);\n\s*}/g,
  "playAudio(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl);"
);

code = code.replace(
  /if \(currentCard\.reading \|\| currentCard\.kanji!\) {\n\s*const utterance = new SpeechSynthesisUtterance\(currentCard\.reading \|\| currentCard\.kanji!\);\n\s*utterance\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(utterance\);\n\s*}/g,
  "playAudio(e, currentCard.reading || currentCard.kanji!, currentCard.audioUrl);"
);

code = code.replace(
  /const u = new SpeechSynthesisUtterance\(result\.dialogue\.japanese\);\n\s*u\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(u\);/g,
  "playAudio(e, result.dialogue.japanese, result.dialogue.audioUrl);"
);

fs.writeFileSync('src/components/ConversationView.tsx', code);
