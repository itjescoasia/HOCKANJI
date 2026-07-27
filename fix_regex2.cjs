const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetRegexStr = '/[.,!?;:\\\'"()[]{}\\\\/_-]/g';
const replaceRegexStr = '/[^a-zA-Z0-9 ]/g';

content = content.split(targetRegexStr).join(replaceRegexStr);
fs.writeFileSync('src/components/ConversationView.tsx', content);
