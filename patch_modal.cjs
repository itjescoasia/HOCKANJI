const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `{conversations.filter(c => c.id !== conversation.id).length === 0 && (
                <div className="text-center py-8 text-theme-primary/50 text-sm italic">
                  Không có chủ đề nào khác để chuyển tới
                </div>
              )}`;

const newStr = `{conversations.filter(c => c.id !== conversation.id).length === 0 && (
                <div className="text-center py-4 text-theme-primary/50 text-sm italic">
                  Không có hội thoại nào khác để chuyển tới
                </div>
              )}
              
              <hr className="border-theme-subtle my-2" />
              <button
                onClick={() => {
                  const d = conversation.dialogues.find(x => x.id === movingDialogueId);
                  if (d && onAddIntensiveWord) {
                    onAddIntensiveWord({
                      id: String(Date.now()) + Math.random().toString(36).slice(2),
                      word: d.japanese,
                      reading: d.hiragana || "",
                      category: "Khác",
                      explanation: d.explanation || "",
                      examples: [{
                        id: d.id,
                        sentence: d.japanese,
                        reading: d.hiragana,
                        romaji: d.romaji,
                        translation: d.vietnamese,
                        specialNote: d.explanation || "",
                        hasAudio: d.hasAudio,
                        audioUrl: d.audioUrl
                      }],
                      createdAt: Date.now()
                    });
                    onUpdate(conversation.id, {
                      dialogues: conversation.dialogues.filter(x => x.id !== movingDialogueId)
                    });
                    setMovingDialogueId(null);
                  }
                }}
                className="w-full text-left px-4 py-3 text-base text-theme-accent hover:bg-theme-accent/10 rounded-lg border border-theme-accent/30 transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-4 font-medium italic">Tạo thành Chuyên đề mới</span>
                <Brain className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched ConversationView modal");
