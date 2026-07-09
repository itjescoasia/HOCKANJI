const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
/\{card\.exampleTranslation \&\& \(\r?\n\s*<div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title=\{card\.exampleTranslation\}>\{card\.exampleTranslation\}<\/div>\r?\n\s*\)\}\r?\n\s*<\/div>/,
`{card.exampleTranslation && (
                                  <div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={card.exampleTranslation}>{card.exampleTranslation}</div>
                                )}
                              </div></HighlightProvider>`
);

fs.writeFileSync('src/components/VocabList.tsx', code);
