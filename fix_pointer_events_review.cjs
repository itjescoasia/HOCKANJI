const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

code = code.replace(
  /className=\{\`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl overflow-y-auto p-4 sm:p-8 \`\}/g,
  `className={\`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl overflow-y-auto p-4 sm:p-8 \${showAnswer ? 'pointer-events-none' : ''}\`}`
);
code = code.replace(
  /className=\{\`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl \`\}/g,
  `className={\`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl \${!showAnswer ? 'pointer-events-none' : ''}\`}`
);
fs.writeFileSync('src/components/ReviewSession.tsx', code);
