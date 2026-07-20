const fs = require('fs');
const content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');
const newContent = content.replace(
`            <div className="relative border border-theme-subtle bg-theme-panel p-8 min-h-[300px] flex flex-col justify-center rounded-xl shadow-lg">
              <div className="absolute top-4 left-4 text-theme-primary/30 font-serif text-xl">`,
`            <div className="relative border border-theme-subtle bg-theme-panel p-8 min-h-[300px] flex flex-col rounded-xl shadow-lg">
              <div className="flex-1 shrink-0 min-h-0" />
              <div className="absolute top-4 left-4 text-theme-primary/30 font-serif text-xl">`
).replace(
`                    <div className="relative z-10 text-base md:text-lg text-theme-primary/80 leading-relaxed font-serif markdown-body">
                      <Markdown>{conversation.dialogues[currentSlideIndex].explanation}</Markdown>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2">`,
`                    <div className="relative z-10 text-base md:text-lg text-theme-primary/80 leading-relaxed font-serif markdown-body">
                      <Markdown>{conversation.dialogues[currentSlideIndex].explanation}</Markdown>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-1 shrink-0 min-h-0" />
              <div className="absolute -left-6 top-1/2 -translate-y-1/2">`
);
fs.writeFileSync('src/components/ConversationView.tsx', newContent);
