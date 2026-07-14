const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

// replace showAnswer with flippedState
code = code.replace(
  /const \[showAnswer, setShowAnswer\] = useState\(false\);/g,
  `const [flippedState, setFlippedState] = useState<Record<number, boolean>>({});\n  const showAnswer = flippedState[currentIndex] || false;\n  const setShowAnswer = (val: boolean) => setFlippedState(prev => ({ ...prev, [currentIndex]: val }));`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
