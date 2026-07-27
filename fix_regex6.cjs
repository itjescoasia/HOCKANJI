const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return str.normalize("NFD").replace') && lines[i].includes('trim()')) {
    lines[i] = '      return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9 ]/g, " ").replace(/\\s+/g, " ").trim();';
  }
}
fs.writeFileSync('src/components/ConversationView.tsx', lines.join('\n'));
