const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf-8');

if (!code.includes('RelatedHighlight')) {
  code = code.replace(
    "import { renderExampleHighlight } from '../utils/highlight';",
    "import { renderExampleHighlight, RelatedHighlight } from '../utils/highlight';"
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

  fs.writeFileSync('src/components/VocabList.tsx', code);
  console.log('done vocab');
}
