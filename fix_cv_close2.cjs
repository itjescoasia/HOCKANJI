const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// For the list item
content = content.replace(
  '{dialogue.vietnamese}\n                                    </p>\n                                  )}\n                                </div>\n                              </div>',
  '{dialogue.vietnamese}\n                                    </p>\n                                  )}\n                                </div></HighlightProvider>\n                              </div>'
);

// Ah wait, it's probably missing some spaces.
content = content.replace(
/\{dialogue\.vietnamese\}\r?\n\s*<\/p>\r?\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>/,
`{dialogue.vietnamese}
                                    </p>
                                  )}
                                </div></HighlightProvider>
                              </div>`
);

fs.writeFileSync('src/components/ConversationView.tsx', content);
