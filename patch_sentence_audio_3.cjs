const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const target = `                {conversation.dialogues[currentSlideIndex].vietnamese && (
                  <p className="text-xl text-theme-primary/70 italic mt-4">
                    <HighlightVietnamese text={conversation.dialogues[currentSlideIndex].vietnamese || ""} />
                  </p>
                )}
              </div></HighlightProvider>`;

const replacement = `                {conversation.dialogues[currentSlideIndex].vietnamese && (
                  <p className="text-xl text-theme-primary/70 italic mt-4">
                    <HighlightVietnamese text={conversation.dialogues[currentSlideIndex].vietnamese || ""} />
                  </p>
                )}
              </div></HighlightProvider>
              <div className="flex justify-center mt-6">
                <SentenceAudio 
                  conversationId={conversation.id} 
                  dialogue={conversation.dialogues[currentSlideIndex]} 
                  onUpdateDialogue={handleUpdateDialogueField} 
                />
              </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Patched slideshow mode");
} else {
  console.log("Target not found");
}

