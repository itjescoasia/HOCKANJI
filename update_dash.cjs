const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!code.includes('RelatedHighlight')) {
  code = code.replace(
    'import { renderExampleHighlight } from "../utils/highlight";',
    'import { renderExampleHighlight, RelatedHighlight } from "../utils/highlight";'
  );
  
  code = code.replace(
    '{sentenceOfTheDay.example.reading}',
    '<RelatedHighlight text={sentenceOfTheDay.example.reading} type="hiragana" />'
  );

  code = code.replace(
    '{sentenceOfTheDay.example.romaji}',
    '<RelatedHighlight text={sentenceOfTheDay.example.romaji} type="romaji" />'
  );

  fs.writeFileSync('src/components/Dashboard.tsx', code);
  console.log('done dash');
}
