const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replaceAll(
  "if (file && file.type.startsWith('audio/')) {",
  "if (file) {"
);

content = content.replaceAll(
  'accept="audio/*"',
  'accept="audio/*,.mp3,.wav,.m4a"'
);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched file uploads");
