const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace(/\\n\\n\.theme-dim/g, '\n\n.theme-dim');
content = content.replace(/}\\n\\n/g, '}\n\n');

fs.writeFileSync('src/index.css', content);
console.log("Fixed newlines in css");
