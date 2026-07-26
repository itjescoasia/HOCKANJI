const fs = require('fs');

let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const modalHTML = `
      {/* Modal for Moving Dialogue */}
      {movingDialogueId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMovingDialogueId(null)}
          />
          <div className="bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif text-theme-primary">
                Chuyển sang chủ đề khác
              </h3>
              <button
                onClick={() => setMovingDialogueId(null)}
                className="p-2 text-theme-primary/40 hover:text-theme-primary transition-colors rounded-full hover:bg-theme-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 flex flex-col gap-2">
              {conversations.filter(c => c.id !== conversation.id).map(targetConv => (
                <button
                  key={targetConv.id}
                  onClick={() => {
                    const dialogueToMove = conversation.dialogues.find(d => d.id === movingDialogueId);
                    if (dialogueToMove) {
                      handleMoveDialogue(dialogueToMove, targetConv.id);
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-base text-theme-primary/80 hover:text-theme-accent hover:bg-theme-accent/10 rounded-lg border border-theme-subtle hover:border-theme-accent/30 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-4 font-medium">{targetConv.title}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              
              {conversations.filter(c => c.id !== conversation.id).length === 0 && (
                <div className="text-center py-8 text-theme-primary/50 text-sm italic">
                  Không có chủ đề nào khác để chuyển tới
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/function getVocabForConversation/g, modalHTML + '\nfunction getVocabForConversation');

fs.writeFileSync('src/components/ConversationView.tsx', content);
