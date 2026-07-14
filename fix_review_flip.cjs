const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

code = code.replace(
  /const \[showAnswer, setShowAnswer\] = useState\(false\);/g,
  `const [flippedState, setFlippedState] = useState<Record<number, boolean>>({});\n  const showAnswer = flippedState[currentIndex] || false;\n  const setShowAnswer = (val: boolean) => setFlippedState(prev => ({ ...prev, [currentIndex]: val }));`
);

// We need to NOT reset the old index when moving to next.
// Wait, the easiest way is to just let setShowAnswer(false) be replaced by doing nothing.
// But we DO need to ensure the next index is false!
code = code.replace(
  /setShowAnswer\(false\);\n\s*setCurrentIndex\(prev => prev \+ 1\);/g,
  `setFlippedState(fs => ({ ...fs, [currentIndex + 1]: false })); setCurrentIndex(prev => prev + 1);`
);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
