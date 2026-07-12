const fs = require('fs');
const content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target1 = `  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }[] = [
    { text: example, status: 'neutral' }
  ];`;

const replacement1 = `  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }[] = [];
  
  // Parse manual *highlights* first
  let currentExample = example;
  let nextAsterisk = currentExample.indexOf('*');
  while (nextAsterisk !== -1) {
    const endAsterisk = currentExample.indexOf('*', nextAsterisk + 1);
    if (endAsterisk !== -1) {
      if (nextAsterisk > 0) {
        tokens.push({ text: currentExample.substring(0, nextAsterisk), status: 'neutral' });
      }
      const markedText = currentExample.substring(nextAsterisk + 1, endAsterisk);
      tokens.push({ text: markedText, status: 'target', card: fallbackTargetCard });
      currentExample = currentExample.substring(endAsterisk + 1);
      nextAsterisk = currentExample.indexOf('*');
    } else {
      break;
    }
  }
  if (currentExample.length > 0) {
    tokens.push({ text: currentExample, status: 'neutral' });
  }`;

let newContent = content.replace(target1, replacement1);
fs.writeFileSync('src/utils/highlight.tsx', newContent);
console.log("Patched tokenizeExampleText with * manual highlights");
