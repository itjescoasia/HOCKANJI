const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/config: \{\s*responseMimeType: 'application\/json',\s*\}[\s\S]*?\}\s*\}\s*\}\s*\}/g, "config: { responseMimeType: 'application/json' }");
fs.writeFileSync('server.ts', code);
