const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  'import { renderExampleHighlight, RelatedHighlight, HighlightProvider } from "../utils/highlight";',
  'import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";'
);

code = code.replace(
  ': questionText}',
  ': <HighlightVietnamese text={questionText} />}'
);

code = code.replace(
  ': answerText}',
  ': <HighlightVietnamese text={answerText} />}'
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
