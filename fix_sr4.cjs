const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
/                    <\/div>\r?\n\s*<\/div>\r?\n\s*<\/>/,
`                    </div>
                  </div>
                </HighlightProvider>
                </>`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
