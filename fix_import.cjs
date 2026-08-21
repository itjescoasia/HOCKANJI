const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');
code = `import { cleanMarkdownForDisplay } from '../utils/stringUtils';\n` + code;
fs.writeFileSync('src/components/VocabList.tsx', code);
