const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf-8');

if (!code.includes('RelatedHighlight')) {
  code = code.replace(
    'import { renderExampleHighlight } from "../utils/highlight";',
    'import { renderExampleHighlight, RelatedHighlight } from "../utils/highlight";'
  );
  
  code = code.replace(
    '{currentExample.reading}',
    '<RelatedHighlight text={currentExample.reading} type="hiragana" />'
  );

  code = code.replace(
    '{currentExample.reading}',
    '<RelatedHighlight text={currentExample.reading} type="hiragana" />'
  );

  if (code.includes('{currentExample.romaji}')) {
    code = code.replace(
      '{currentExample.romaji}',
      '<RelatedHighlight text={currentExample.romaji} type="romaji" />'
    );
  }

  fs.writeFileSync('src/components/SentenceReview.tsx', code);
  console.log('done sent');
}
