const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

code = code.replace(
  /if \('speechSynthesis' in window\) {\n\s*window\.speechSynthesis\.cancel\(\);\n\s*const utterance = new SpeechSynthesisUtterance\(text\);\n\s*utterance\.lang = 'ja-JP';\n\s*\/\/ Tùy chỉnh tham số phụ để nghe tự nhiên hơn một chút\n\s*utterance\.rate = 0\.9; \/\/ Đọc chậm lại một xíu giúp nghe rõ hơn\n\s*const bestVoice = getJapaneseVoice\(\);\n\s*if \(bestVoice\) {\n\s*utterance\.voice = bestVoice;\n\s*}\n\s*window\.speechSynthesis\.speak\(utterance\);\n\s*}/g,
  "playTTS(text);"
);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
