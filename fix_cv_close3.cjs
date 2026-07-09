const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace(
/\{dialogue\.vietnamese\}\r?\n\s*<\/p>\r?\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*<div className="flex flex-col gap-2/,
`{dialogue.vietnamese}
                                    </p>
                                  )}
                                </div></HighlightProvider>
                                <div className="flex flex-col gap-2`
);

fs.writeFileSync('src/components/ConversationView.tsx', content);
