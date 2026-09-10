const fs = require('fs');
let code = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');

code = code.replace(
  "const playAudio = (e: React.MouseEvent, text: string) => {\n    e.stopPropagation();\n    if (!text || !('speechSynthesis' in window)) return;\n    const utterance = new SpeechSynthesisUtterance(text);\n    utterance.lang = 'ja-JP';\n    window.speechSynthesis.speak(utterance);\n  };",
  "const playAudio = (e: React.MouseEvent, text: string, audioUrl?: string | null) => {\n    e.stopPropagation();\n    if (audioUrl) {\n      const audio = new Audio(audioUrl);\n      audio.play().catch(console.error);\n      return;\n    }\n    if (!text || !('speechSynthesis' in window)) return;\n    window.speechSynthesis.cancel();\n    const utterance = new SpeechSynthesisUtterance(text);\n    utterance.lang = 'ja-JP';\n    window.speechSynthesis.speak(utterance);\n  };"
);

code = code.replace(
  "playAudio(e, currentWord.kanji || currentWord.reading);",
  "playAudio(e, currentWord.kanji || currentWord.reading, currentWord.audioUrl);"
);

code = code.replace(
  "playAudio(e, currentWord.reading || currentWord.kanji);",
  "playAudio(e, currentWord.reading || currentWord.kanji, currentWord.audioUrl);"
);

fs.writeFileSync('src/components/ShortStudySession.tsx', code);
