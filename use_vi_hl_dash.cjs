const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  'import { renderExampleHighlight, RelatedHighlight, HighlightProvider } from "../utils/highlight";',
  'import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";'
);

code = code.replace(
  '{sentenceOfTheDay.example.translation}',
  '<HighlightVietnamese text={sentenceOfTheDay.example.translation || ""} />'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
