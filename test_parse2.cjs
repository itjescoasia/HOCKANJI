const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/config: \{ responseMimeType: 'application\/json' \}\n\s*\}/g, "config: { responseMimeType: 'application/json' }\n            });");
fs.writeFileSync('server.ts', content);
