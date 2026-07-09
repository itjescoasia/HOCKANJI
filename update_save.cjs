const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf-8');
code = code.replace(
  /saveAs\(blob, \`\$\{conversation\.title\}\.docx\`\);/,
  `const now = getVietnamDate();
    const dateStr = \`\$\{now.getFullYear()\}\$\{String(now.getMonth()+1).padStart(2,'0')\}\$\{String(now.getDate()).padStart(2,'0')\}_\$\{String(now.getHours()).padStart(2,'0')\}\$\{String(now.getMinutes()).padStart(2,'0')\}\`;
    saveAs(blob, \`\$\{conversation.title\}_\$\{dateStr\}.docx\`);`
);
fs.writeFileSync('src/components/ConversationView.tsx', code);
