const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /if \(\(e\.target as HTMLElement\)\.tagName === 'BUTTON' \|\| \(e\.target as HTMLElement\)\.closest\('button'\) \|\| \(e\.target as HTMLElement\)\.closest\('form'\)\) \{\n           return;\n        \}\n        setShowAnswer\(!showAnswer\);\n      \}\}/g,
  `if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('form')) {\n           return;\n        }\n        if (showAnswer) return;\n        setShowAnswer(true);\n      }}`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
