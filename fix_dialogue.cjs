const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

code = code.replace(
  /dialogues: \[\.\.\.conversation\.dialogues, newDialogue\]/g,
  'dialogues: [newDialogue, ...conversation.dialogues]'
);

fs.writeFileSync('src/components/ConversationView.tsx', code);
