const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

code = code.replace(
  "const playAudio = (e: React.MouseEvent, text: string) => {\n    e.stopPropagation();\n    if (!text || !('speechSynthesis' in window)) return;\n    const utterance = new SpeechSynthesisUtterance(text);\n    utterance.lang = 'ja-JP';\n    window.speechSynthesis.speak(utterance);\n  };",
  "const playAudio = (e: React.MouseEvent, text: string, audioUrl?: string | null) => {\n    e.stopPropagation();\n    if (audioUrl) {\n      const audio = new Audio(audioUrl);\n      audio.play().catch(console.error);\n      return;\n    }\n    if (!text || !('speechSynthesis' in window)) return;\n    window.speechSynthesis.cancel();\n    const utterance = new SpeechSynthesisUtterance(text);\n    utterance.lang = 'ja-JP';\n    window.speechSynthesis.speak(utterance);\n  };"
);

code = code.replace(
  "onClick={(e) => playAudio(e, dialogue.japanese)}",
  "onClick={(e) => playAudio(e, dialogue.japanese, dialogue.audioUrl)}"
);

fs.writeFileSync('src/components/ConversationView.tsx', code);
