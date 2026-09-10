const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

code = code.replace(
  /const playAudio = \(e: React\.MouseEvent, textToSpeak: string\) => {\n\s*e\.stopPropagation\(\);\n\s*if \(!textToSpeak \|\| !\('speechSynthesis' in window\)\) return;\n\s*const utterance = new SpeechSynthesisUtterance\(textToSpeak\);\n\s*utterance\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(utterance\);\n\s*};/,
  `const playAudio = (e: React.MouseEvent, textToSpeak: string, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
      return;
    }
    if (!textToSpeak || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };`
);

code = code.replace(
  "onClick={(e) => playAudio(e, text)}",
  "onClick={(e) => playAudio(e, text, matchedForm?.audioUrl || card.audioUrl)}"
);

fs.writeFileSync('src/utils/highlight.tsx', code);
