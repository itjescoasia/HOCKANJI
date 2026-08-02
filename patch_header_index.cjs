const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// replace z-index
content = content.replace("className=\"sticky top-0 z-10 bg-theme-base/80 backdrop-blur-md border-b border-theme-subtle\"", "className=\"sticky top-0 z-50 bg-theme-base/80 backdrop-blur-md border-b border-theme-subtle\"");

fs.writeFileSync('src/components/Header.tsx', content);
console.log("Patched Header.tsx successfully");
