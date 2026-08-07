const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replaceAll(
  "document.documentElement.classList.remove('theme-light', 'theme-sepia');",
  "document.documentElement.classList.remove('theme-light', 'theme-sepia', 'theme-dim');"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx theme classes");
