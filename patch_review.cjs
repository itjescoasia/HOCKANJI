const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

code = code.replace(
  "const handleSpeak = (e: React.MouseEvent, text: string) => {\n    e.stopPropagation();\n    if ('speechSynthesis' in window) {",
  "const handleSpeak = (e: React.MouseEvent, text: string, audioUrl?: string | null) => {\n    e.stopPropagation();\n    if (audioUrl) {\n      const audio = new Audio(audioUrl);\n      audio.play().catch(console.error);\n      return;\n    }\n    if ('speechSynthesis' in window) {"
);

code = code.replace(
  /onClick=\{\(e\) => handleSpeak\(e, currentCard\.kanji \|\| currentCard\.reading\)\}/g,
  "onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}"
);

code = code.replace(
  "onClick={(e) => handleSpeak(e, ex.sentence)}",
  "onClick={(e) => handleSpeak(e, ex.sentence, ex.audioUrl)}"
);

code = code.replace(
  "onClick={(e) => handleSpeak(e, currentCard.example!)}",
  "onClick={(e) => handleSpeak(e, currentCard.example!, currentCard.audioUrl)}"
);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
