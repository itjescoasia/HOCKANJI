const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace(/\\/\\\[\.,!\?;:'"\(\)\[\\]\{\\}\\\\/_-\\]\\/g/g, '/[.,!?;:\\\'"()\\\\[\\\\]{}|\\\\\\/_-]/g');
fs.writeFileSync('src/components/ConversationView.tsx', content);
