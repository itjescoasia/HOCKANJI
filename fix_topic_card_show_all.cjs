const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `                      {searchQuery.trim() !== "" && (
                        <div className="mb-4 flex flex-col gap-2">
                          {conv.dialogues
                            .filter(d => {
                              const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() : "";
                              const query = removeAccents(searchQuery);
                              return removeAccents(d.japanese).includes(query) || 
                                     removeAccents(d.vietnamese).includes(query) ||
                                     removeAccents(d.hiragana).includes(query) ||
                                     removeAccents(d.romaji).includes(query);
                            })
                            .slice(0, 2)
                            .map((d, i) => (
                              <div key={i} className="bg-theme-base p-2 border border-theme-subtle rounded-md text-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-theme-primary font-serif">{d.japanese}</p>
                                    <p className="text-theme-primary/60 text-xs mt-1">{d.vietnamese}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const u = new SpeechSynthesisUtterance(d.japanese);
                                      u.lang = 'ja-JP';
                                      window.speechSynthesis.speak(u);
                                    }}
                                    className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0"
                                    title="Nghe phát âm"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          }
                          {conv.dialogues.filter(d => 
                              d.japanese.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (d.hiragana && d.hiragana.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (d.romaji && d.romaji.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).length > 2 && (
                            <p className="text-xs text-theme-primary/40 italic">...và thêm các kết quả khác</p>
                          )}
                        </div>
                      )}`;

const replaceStr = `                      {searchQuery.trim() !== "" && (() => {
                        const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() : "";
                        const query = removeAccents(searchQuery);
                        const matchedDialogues = conv.dialogues.filter(d => 
                          removeAccents(d.japanese).includes(query) || 
                          removeAccents(d.vietnamese).includes(query) ||
                          removeAccents(d.hiragana).includes(query) ||
                          removeAccents(d.romaji).includes(query)
                        );
                        
                        if (matchedDialogues.length === 0) return null;
                        
                        return (
                          <div className="mb-4 flex flex-col gap-2">
                            {matchedDialogues.slice(0, 5).map((d, i) => (
                              <div key={i} className="bg-theme-base p-2 border border-theme-subtle rounded-md text-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-theme-primary font-serif">{d.japanese}</p>
                                    <p className="text-theme-primary/60 text-xs mt-1">{d.vietnamese}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const u = new SpeechSynthesisUtterance(d.japanese);
                                      u.lang = 'ja-JP';
                                      window.speechSynthesis.speak(u);
                                    }}
                                    className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0"
                                    title="Nghe phát âm"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {matchedDialogues.length > 5 && (
                              <p className="text-xs text-theme-primary/40 italic">...và thêm {matchedDialogues.length - 5} kết quả khác</p>
                            )}
                          </div>
                        );
                      })()}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Updated Topic Card search matches logic");
} else {
  console.log("Could not find Target Content");
}
