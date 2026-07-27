const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `                                <p className="text-theme-primary font-serif">{d.japanese}</p>
                                <p className="text-theme-primary/60 text-xs mt-1">{d.vietnamese}</p>
                              </div>
                            ))`;

const replaceStr = `                                <div className="flex items-start justify-between gap-2">
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
                            ))`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Updated Topic Card to show audio matches");
} else {
  console.log("Could not find Target Content");
}
