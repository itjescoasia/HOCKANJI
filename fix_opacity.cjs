const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /<div className="mb-6 opacity-70">/g,
  '<div className="mb-6 text-theme-primary/70">'
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
