const fs = require('fs');

let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
content = content.replace('<Markdown>{ex.specialNote}</Markdown>', '<Markdown>{cleanMarkdownForDisplay(ex.specialNote)}</Markdown>');
fs.writeFileSync('src/components/IntensiveStudy.tsx', content);

console.log('Patched note');
