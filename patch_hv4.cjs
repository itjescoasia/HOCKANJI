const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target = `            searchIdx = idx + 1;
          }
        if (foundMatch) break;`;

const replacement = `            searchIdx = idx + 1;
          }
        }
        if (foundMatch) break;`;

file = file.replace(target, replacement);
fs.writeFileSync('src/utils/highlight.tsx', file);
console.log('Patched bracket');
