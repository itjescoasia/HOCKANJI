const fs = require('fs');

let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const inlineSnippet = `{movingDialogueId === dialogue.id && (
                                <div className="mt-3 p-4 bg-theme-panel/50 rounded border border-theme-subtle">
                                  <h4 className="text-sm font-semibold text-theme-primary mb-3">Chuyển sang chủ đề:</h4>
                                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                    {conversations.filter(c => c.id !== conversation.id).map(targetConv => (
                                      <button
                                        key={targetConv.id}
                                        onClick={() => handleMoveDialogue(dialogue, targetConv.id)}
                                        className="text-left px-3 py-2 text-sm text-theme-primary/80 hover:text-theme-accent hover:bg-theme-accent/5 rounded border border-transparent hover:border-theme-accent/20 transition-all truncate"
                                      >
                                        {targetConv.title}
                                      </button>
                                    ))}
                                    {conversations.filter(c => c.id !== conversation.id).length === 0 && (
                                      <span className="text-theme-primary/50 text-sm italic">Không có chủ đề nào khác</span>
                                    )}
                                  </div>
                                </div>
                              )}`;

content = content.replace(inlineSnippet, '');

fs.writeFileSync('src/components/ConversationView.tsx', content);
