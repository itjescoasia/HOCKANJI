const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

code = code.replace(
/                                  <\/AnimatePresence>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/>/,
`                                  </AnimatePresence>
                                </div></HighlightProvider>
                              </div>
                            </>`
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
