const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  "import { renderExampleHighlight, RelatedHighlight, HighlightProvider } from '../utils/highlight';",
  "import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from '../utils/highlight';"
);

code = code.replace(
  '<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={ex.translation}>{ex.translation}</div>',
  '<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={ex.translation}><HighlightVietnamese text={ex.translation || ""} /></div>'
);

code = code.replace(
  '<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={card.exampleTranslation}>{card.exampleTranslation}</div>',
  '<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={card.exampleTranslation}><HighlightVietnamese text={card.exampleTranslation || ""} /></div>'
);

fs.writeFileSync('src/components/VocabList.tsx', code);
