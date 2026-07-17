const fs = require('fs');
let file = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

file = file.replace(
  'const [isInitialized, setIsInitialized] = useState(false);',
  `const [isInitialized, setIsInitialized] = useState(false);

  const handleTTS = (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };`
);

fs.writeFileSync('src/components/SentenceReview.tsx', file);
