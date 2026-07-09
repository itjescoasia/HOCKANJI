const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf-8');

code = code.replace(
  'import { renderExampleHighlight as baseRenderExampleHighlight } from "../utils/highlight";',
  'import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight } from "../utils/highlight";'
);

code = code.replace(
  '{ex.reading}',
  '<RelatedHighlight text={ex.reading} type="hiragana" />'
);

if (code.includes('{ex.romaji}')) {
  code = code.replace(
    '{ex.romaji}',
    '<RelatedHighlight text={ex.romaji} type="romaji" />'
  );
}

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
console.log('done int');
