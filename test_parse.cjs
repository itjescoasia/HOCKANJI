const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

let fixed = content.replace(/\}\);\);\);\n/g, '});\n');
fixed = fixed.replace(/\}\);\);\n/g, '});\n');
fixed = fixed.replace(/\}\);\s*catch/g, '} catch');
fixed = fixed.replace(/\}\);\s*else/g, '} else');
fs.writeFileSync('server.ts', fixed);
