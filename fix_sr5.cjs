const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
`                  </div>
                </HighlightProvider>
                </>`,
`                  </div>
                </HighlightProvider>`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
