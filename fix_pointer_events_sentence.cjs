const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /className=\{\`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center justify-center text-center group overflow-y-auto \`\}/g,
  (match, offset, str) => {
    // Only replace the first one with showAnswer ? 'pointer-events-none' : ''
    // The second one gets !showAnswer ? 'pointer-events-none' : ''
    return str.indexOf(match) === offset 
      ? `className={\`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center justify-center text-center group overflow-y-auto \${showAnswer ? 'pointer-events-none' : ''}\`}`
      : `className={\`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center justify-center text-center group overflow-y-auto \${!showAnswer ? 'pointer-events-none' : ''}\`}`;
  }
);
fs.writeFileSync('src/components/SentenceReview.tsx', code);
