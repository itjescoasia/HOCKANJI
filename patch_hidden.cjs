const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace(/className="hidden"/g, 'className="sr-only"');

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched hidden to sr-only");
