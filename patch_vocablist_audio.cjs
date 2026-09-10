const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  "if (!text || !('speechSynthesis' in window)) return;\n    const utterance = new SpeechSynthesisUtterance(text);",
  "if (!text || !('speechSynthesis' in window)) return;\n    window.speechSynthesis.cancel();\n    const utterance = new SpeechSynthesisUtterance(text);"
);

fs.writeFileSync('src/components/VocabList.tsx', code);
