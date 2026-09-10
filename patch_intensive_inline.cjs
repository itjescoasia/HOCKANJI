const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

code = code.replace(
  /const u = new SpeechSynthesisUtterance\(ex\.sentence\);\n\s*u\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(u\);/g,
  "playAudio(e, ex.sentence, ex.audioUrl);"
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
