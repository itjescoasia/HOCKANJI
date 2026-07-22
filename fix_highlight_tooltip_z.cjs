const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

code = code.replace(
  /bg-theme-panel border border-theme-subtle rounded shadow-xl p-4 z-50 flex flex-col gap-1 text-left/g,
  'bg-theme-panel border border-theme-subtle rounded shadow-xl p-4 z-[9999] flex flex-col gap-1 text-left'
);

fs.writeFileSync('src/utils/highlight.tsx', code);
