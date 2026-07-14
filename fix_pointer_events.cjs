const fs = require('fs');

let code = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');
code = code.replace(
  /className=\{\`absolute inset-0 bg-theme-hover border border-theme-subtle p-8 md:p-12 rounded-lg flex flex-col items-center justify-center shadow-xl group \`\}/g,
  `className={\`absolute inset-0 bg-theme-hover border border-theme-subtle p-8 md:p-12 rounded-lg flex flex-col items-center justify-center shadow-xl group \${isMeaningShown ? 'pointer-events-none' : ''}\`}`
);
code = code.replace(
  /className=\{\`absolute inset-0 bg-theme-hover border border-theme-subtle p-6 md:p-10 rounded-lg flex flex-col items-center shadow-xl group overflow-y-auto custom-scrollbar \`\}/g,
  `className={\`absolute inset-0 bg-theme-hover border border-theme-subtle p-6 md:p-10 rounded-lg flex flex-col items-center shadow-xl group overflow-y-auto custom-scrollbar \${!isMeaningShown ? 'pointer-events-none' : ''}\`}`
);
fs.writeFileSync('src/components/ShortStudySession.tsx', code);
