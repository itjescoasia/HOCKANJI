const fs = require('fs');
let file = fs.readFileSync('src/index.css', 'utf8');
file = file.replace('@import "tailwindcss";', '@import "tailwindcss";\n@plugin "@tailwindcss/typography";');
fs.writeFileSync('src/index.css', file);
console.log('Patched index.css');
