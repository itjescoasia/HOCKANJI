const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('const highlightSearchTerm = '));
let endIndex = -1;
for (let i = startIndex + 1; i < lines.length; i++) {
  if (lines[i].includes('const regex = new RegExp')) {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex + 1, endIndex - startIndex - 1, 
    '    if (!text) return "";',
    '    if (!highlight || !highlight.trim()) return text;',
    '    const escapedHighlight = highlight.trim().replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");'
  );
  fs.writeFileSync(file, lines.join('\n'));
  console.log("Fixed!");
} else {
  console.log("Not found.");
}
