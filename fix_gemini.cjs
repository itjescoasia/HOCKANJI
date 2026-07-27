const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/gemini-3\.5-flash/g, 'gemini-2.5-flash');
content = content.replace(/gemini-3\.1-flash-lite/g, 'gemini-2.5-flash'); // Just use 2.5 flash as fallback or 2.0-flash-lite
fs.writeFileSync('server.ts', content);
