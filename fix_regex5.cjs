const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[.,!?;:'"()[]{}\\\\/_-]/g, " ").replace(/\\s+/g, " ").trim();`;
const replaceStr = `return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9 đĐ]/g, " ").replace(/\\s+/g, " ").trim();`;

let index = content.indexOf('return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[.,!?;:\\\'"()[]{}\\\\/_-]/g, " ").replace(/\\s+/g, " ").trim();');

if(index !== -1) {
  content = content.replaceAll('return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[.,!?;:\\\'"()[]{}\\\\/_-]/g, " ").replace(/\\s+/g, " ").trim();', replaceStr);
}

// Let's just find the exact line and replace it manually.
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return str.normalize("NFD").replace') && lines[i].includes('trim()')) {
    lines[i] = '      return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9 đĐ]/g, " ").replace(/\\s+/g, " ").trim();';
  }
}
fs.writeFileSync('src/components/ConversationView.tsx', lines.join('\n'));
