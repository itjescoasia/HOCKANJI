const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

code = code.replace(
  'import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight, HighlightProvider } from "../utils/highlight";',
  'import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";'
);

code = code.replace(
  '({ex.translation})',
  '(<HighlightVietnamese text={ex.translation || ""} />)'
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
