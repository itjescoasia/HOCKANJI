const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/\}\);\n\s*catch/g, '} catch');
content = content.replace(/\}\);\n\s*catch/g, '} catch');
content = content.replace(/\}\);\s*catch/g, '} catch');

fs.writeFileSync('server.ts', content);
