const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

code = code.replace(
`                  <p className="text-xl text-theme-primary/70 italic mt-4">
                    {conversation.dialogues[currentSlideIndex].vietnamese}
                  </p></HighlightProvider>
                )}
              </div>`,
`                  <p className="text-xl text-theme-primary/70 italic mt-4">
                    {conversation.dialogues[currentSlideIndex].vietnamese}
                  </p>
                )}
              </div></HighlightProvider>`
);

fs.writeFileSync('src/components/ConversationView.tsx', code);
