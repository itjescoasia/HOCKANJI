const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

code = code.replace(
  /const playAudio = \(e: React\.MouseEvent, text: string \| undefined \| null\) => {\n    e\.stopPropagation\(\);\n    if \(!text \|\| !\('speechSynthesis' in window\)\) return;\n    const utterance = new SpeechSynthesisUtterance\(text\);\n    utterance\.lang = 'ja-JP';\n    window\.speechSynthesis\.speak\(utterance\);\n  };/g,
  `const playAudio = (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
      return;
    }
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };`
);

code = code.replace(
  "onClick={(e) => playAudio(e, word.word || word.reading)}",
  "onClick={(e) => playAudio(e, word.word || word.reading, word.audioUrl)}"
);

code = code.replace(
  "onClick={(e) => playAudio(e, ex.sentence)}",
  "onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}"
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
