const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/\}\);\);\);\n/g, '});\n');
content = content.replace(/\}\);\);\n/g, '});\n');
content = content.replace(/\}\);\s*catch/g, '} catch');
content = content.replace(/\}\);\s*else/g, '} else');
fs.writeFileSync('server.ts', content);
