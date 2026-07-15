const fs = require('fs');
const file = 'src/components/SentenceReview.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/editData\.sentence\.trim\(\)/g, '(editData.sentence || "").trim()');
content = content.replace(/editData\.reading\.trim\(\)/g, '(editData.reading || "").trim()');
content = content.replace(/editData\.romaji\.trim\(\)/g, '(editData.romaji || "").trim()');
content = content.replace(/editData\.translation\.trim\(\)/g, '(editData.translation || "").trim()');

fs.writeFileSync(file, content);
console.log('Patched trim errors');
