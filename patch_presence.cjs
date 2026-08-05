const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace('<AnimatePresence mode="wait">', '<AnimatePresence>');
fs.writeFileSync('src/components/ConversationView.tsx', content);
