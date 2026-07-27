const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const badLine = '      return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[.,!?;:\\\'"()[]{}\\\\/_-]/g, " ").replace(/\\s+/g, " ").trim();';
const goodLine = '      return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\\s+/g, " ").trim();';

content = content.replace(badLine, goodLine);
// do it again for the second occurrence
content = content.replace(badLine, goodLine);

fs.writeFileSync('src/components/ConversationView.tsx', content);
