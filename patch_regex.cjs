const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// Replace \${safeStem} with ${safeStem}
content = content.replace(/\\\$\{safeStem\}/g, '${safeStem}');
// Replace \${safeMatchStr} just in case
content = content.replace(/\\\$\{safeMatchStr\}/g, '${safeMatchStr}');

fs.writeFileSync('src/utils/highlight.tsx', content);
