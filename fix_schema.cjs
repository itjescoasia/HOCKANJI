const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/responseMimeType:\s*'application\/json',\s*responseSchema:\s*\{[\s\S]*?\}\s*\},/g, "responseMimeType: 'application/json',\n          }");

fs.writeFileSync('server.ts', code);
