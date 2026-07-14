const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /<\/div>\n\s*\{showAnswer \? \(/g,
  `</div>\n<div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">\n{showAnswer ? (`
);

// Also fix the TypeScript error from `e.target.tagName`
code = code.replace(
  /e\.target\.tagName === 'BUTTON'/g,
  `(e.target as HTMLElement).tagName === 'BUTTON'`
);
code = code.replace(
  /e\.target\.closest\('button'\)/g,
  `(e.target as HTMLElement).closest('button')`
);
code = code.replace(
  /e\.target\.closest\('form'\)/g,
  `(e.target as HTMLElement).closest('form')`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
