const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

let startIndex1 = code.indexOf('{viewingCard && (');
let endIndex1 = code.indexOf('export default function VocabList');

if (startIndex1 !== -1 && endIndex1 !== -1) {
  let corrupted = code.substring(startIndex1, endIndex1);
  code = code.replace(corrupted, `      )}\n    </div>\n  );\n}\n\n`);
}

fs.writeFileSync('src/components/VocabList.tsx', code);
