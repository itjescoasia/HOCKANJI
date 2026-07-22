const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

code = code.replace(
  /className=\{\`relative inline-block \$\{isOpen \? "z-50" : "z-0"\}\`\}/g,
  'className={`relative inline-block ${isOpen ? "z-[9999]" : ""}`}'
);

fs.writeFileSync('src/utils/highlight.tsx', code);
