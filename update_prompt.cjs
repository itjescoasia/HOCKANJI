const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `"Thể sai khiến", "Thể bị động", "Thể mệnh lệnh", "Thể khả năng"`;
const replacement = `"Thể sai khiến (使役形)", "Thể bị động (受身形 - Ukemi)", "Thể sai khiến bị động", "Thể mệnh lệnh", "Thể khả năng"`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
