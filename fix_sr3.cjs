const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
/\{currentExample\.specialNote\}\r?\n\s*<\/div>\r?\n\s*\)\}\r?\n\s*<\/div>/,
`{currentExample.specialNote}
                        </div>
                      )}
                    </div></HighlightProvider>`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
