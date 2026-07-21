const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/config: \{ responseMimeType: 'application\/json' \}\n              \}\n            \},\n\n          \}\n        \}\);/g, "config: { responseMimeType: 'application/json' }\n        });");

code = code.replace(/config: \{ responseMimeType: 'application\/json' \}\n              \}\n            \},\n\n             \}\n           \}\);/g, "config: { responseMimeType: 'application/json' }\n           });");

fs.writeFileSync('server.ts', code);
