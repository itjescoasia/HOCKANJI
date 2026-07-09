const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace('import { renderExampleHighlight, RelatedHighlight } from "../utils/highlight";', 'import { renderExampleHighlight, RelatedHighlight, HighlightProvider } from "../utils/highlight";');
code = code.replace(/<div className="bg-theme-base-alt p-3 rounded-sm border border-theme-subtle group\/ex relative">/g, '<HighlightProvider><div className="bg-theme-base-alt p-3 rounded-sm border border-theme-subtle group/ex relative">');
code = code.replace(/<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title=\{ex\.translation\}>\{ex\.translation\}<\/div>\r?\n\s*<\/div>/g, '<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={ex.translation}>{ex.translation}</div>\n      </div></HighlightProvider>');
code = code.replace(/<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title=\{card\.exampleTranslation\}>\{card\.exampleTranslation\}<\/div>\r?\n\s*<\/div>/g, '<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={card.exampleTranslation}>{card.exampleTranslation}</div>\n                                </div></HighlightProvider>');

fs.writeFileSync('src/components/VocabList.tsx', code);
console.log("Updated VocabList.tsx");
