const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
/<>(\s*)<div className="mb-8 mt-4">/,
`<HighlightProvider>$1<div className="mb-8 mt-4">`
);

code = code.replace(
/\{currentExample\.specialNote\}\r?\n\s*<\/p>\r?\n\s*<\/div>\r?\n\s*\)\}\r?\n\s*<\/div>/,
`{currentExample.specialNote}
                          </p>
                        </div>
                      )}
                    </div></HighlightProvider>`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
