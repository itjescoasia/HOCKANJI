const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  "import { renderExampleHighlight, RelatedHighlight } from '../utils/highlight';",
  "import { renderExampleHighlight, RelatedHighlight, HighlightProvider } from '../utils/highlight';"
);

fs.writeFileSync('src/components/VocabList.tsx', code);
