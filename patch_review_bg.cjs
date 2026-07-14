const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

// The outer container: className={`w-full aspect-[4/3] bg-theme-panel border border-theme-subtle relative shadow-2xl flex flex-col items-center justify-center p-8 mb-10 ${!(isFreeStudy && exerciseType !== 'flip') ? 'cursor-pointer' : ''}`}
code = code.replace(
  /className=\{\`w-full aspect-\[4\/3\] bg-theme-panel border border-theme-subtle relative shadow-2xl flex flex-col items-center justify-center p-8 mb-10 \$\{\!\(isFreeStudy && exerciseType \!\=\= 'flip'\) \? 'cursor-pointer' : ''\}\`\}/g,
  `className={\`w-full aspect-[4/3] relative mb-10 \${!(isFreeStudy && exerciseType !== 'flip') ? 'cursor-pointer' : ''}\`}`
);

// The Front face: className={`absolute inset-0 flex flex-col bg-theme-panel overflow-y-auto p-4 ${showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
code = code.replace(
  /className=\{\`absolute inset-0 flex flex-col bg-theme-panel overflow-y-auto p-4 \$\{showAnswer \? 'opacity-0 pointer-events-none' : 'opacity-100'\}\`\}/g,
  `className={\`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl overflow-y-auto p-4 sm:p-8 \${showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}`
);

// The Back face: className={`absolute inset-0 flex flex-col bg-theme-panel ${!showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
code = code.replace(
  /className=\{\`absolute inset-0 flex flex-col bg-theme-panel \$\{\!showAnswer \? 'opacity-0 pointer-events-none' : 'opacity-100'\}\`\}/g,
  `className={\`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl \${!showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}`
);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
