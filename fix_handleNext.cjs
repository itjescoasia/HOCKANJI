const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

// We just remove setShowAnswer(false) and instead set it for the next index if we need to, but actually we don't need to unless it's looping.
// To be perfectly safe, let's just use `setFlippedState({})` when looping? No, because we want the old card (last index) to stay flipped during exit!
// If we use `setFlippedState(prev => ({ ...prev, [nextIndex]: false }))`, it preserves the old one.

code = code.replace(
  /const handleNext = \(\) => \{\n\s*setShowAnswer\(false\);/g,
  `const handleNext = () => {\n    // do not mutate the old index so it stays flipped during exit`
);

// We need to ensure that the NEXT index is false.
code = code.replace(
  /setCurrentIndex\(\(prev\) => prev \+ 1\);/g,
  `setCurrentIndex((prev) => { setFlippedState(fs => ({ ...fs, [prev + 1]: false })); return prev + 1; });`
);

code = code.replace(
  /setCurrentIndex\(0\);/g,
  `setFlippedState(fs => ({ ...fs, [0]: false })); setCurrentIndex(0);`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
