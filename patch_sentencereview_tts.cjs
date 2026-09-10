const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /window\.speechSynthesis\.cancel\(\);\n\s*const utterance = new SpeechSynthesisUtterance\(text\);\n\s*utterance\.lang = "ja-JP";\n\s*utterance\.rate = 0\.9;\n\s*window\.speechSynthesis\.speak\(utterance\);/g,
  "playTTS(text);"
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
