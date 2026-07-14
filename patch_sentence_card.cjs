const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /<div className="w-full relative" style={{ perspective: "1000px" }}>/g,
  `<div className="w-full relative min-h-[400px] mb-8" style={{ perspective: "1000px" }}>`
);

code = code.replace(
  /<motion.div\n\s+className="w-full relative cursor-pointer"/g,
  `<motion.div\n      className="w-full h-full absolute inset-0 cursor-pointer"`
);

code = code.replace(
  /className=\{\`bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative group \$\{showAnswer \? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'\}\`\}/g,
  `className={\`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center justify-center text-center group overflow-y-auto \${showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}`
);

code = code.replace(
  /className=\{\`bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative group \$\{\!showAnswer \? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'\}\`\}/g,
  `className={\`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center justify-center text-center group overflow-y-auto \${!showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
