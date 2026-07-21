const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

code = code.replace(
  /<span className="absolute bottom-full left-1\/2 -translate-x-1\/2 mb-2 w-max max-w-\[250px\] bg-theme-panel border border-theme-subtle rounded shadow-lg p-3 z-50 flex flex-col gap-1 text-left font-sans text-base whitespace-normal">/g,
  '<span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[280px] max-h-[250px] overflow-y-auto bg-theme-panel border border-theme-subtle rounded shadow-xl p-4 z-50 flex flex-col gap-1 text-left font-sans text-base whitespace-normal">'
);

fs.writeFileSync('src/utils/highlight.tsx', code);
