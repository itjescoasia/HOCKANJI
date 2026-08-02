const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');
console.log(content.indexOf("Upload MP3") > -1);
console.log(content.indexOf("audioUI") > -1);
