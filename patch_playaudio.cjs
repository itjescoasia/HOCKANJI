const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const t0 = `  const playAudio = (e: React.MouseEvent, text: string | undefined | null) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };`;
const r0 = `  const playAudio = (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      new Audio(audioUrl).play().catch(console.error);
      return;
    }
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };`;
code = code.replace(t0, r0);

code = code.replace(/onClick=\{\(e\) => playAudio\(e, ex\.sentence\)\}/g, 'onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}');
code = code.replace(/onClick=\{\(e\) => playAudio\(e, card\.kanji \|\| card\.reading\)\}/g, 'onClick={(e) => playAudio(e, card.kanji || card.reading, card.audioUrl)}');
code = code.replace(/onClick=\{\(e\) => playAudio\(e, card\.example!\)\}/g, 'onClick={(e) => playAudio(e, card.example!, card.audioUrl)}');

fs.writeFileSync('src/components/VocabList.tsx', code);
