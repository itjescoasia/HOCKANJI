const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `                      {conv.description && (
                        <p className="text-theme-primary/60 text-sm mb-6 line-clamp-2">
                          {conv.description}
                        </p>
                      )}`;

const replaceStr = `                      {conv.description && (
                        <p className="text-theme-primary/60 text-sm mb-6 line-clamp-2">
                          {conv.description}
                        </p>
                      )}
                      
                      {searchQuery.trim() !== "" && (
                        <div className="mb-4 flex flex-col gap-2">
                          {conv.dialogues
                            .filter(d => 
                              d.japanese.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (d.hiragana && d.hiragana.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (d.romaji && d.romaji.toLowerCase().includes(searchQuery.toLowerCase()))
                            )
                            .slice(0, 2)
                            .map((d, i) => (
                              <div key={i} className="bg-theme-base p-2 border border-theme-subtle rounded-md text-sm">
                                <p className="text-theme-primary font-serif">{d.japanese}</p>
                                <p className="text-theme-primary/60 text-xs mt-1">{d.vietnamese}</p>
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

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Updated Topic Card to show matches");
} else {
  console.log("Could not find Target Content");
}
