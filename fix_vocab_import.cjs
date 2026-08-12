const fs = require('fs');
let content = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

if (!content.includes("import { cleanTextForSearch")) {
    content = content.replace(
      "import { renderExampleHighlight",
      "import { cleanTextForSearch } from '../utils/stringUtils';\nimport { renderExampleHighlight"
    );
    fs.writeFileSync('src/components/VocabList.tsx', content);
    console.log("Fixed import");
}
