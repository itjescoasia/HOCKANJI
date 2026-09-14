const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const t = `                            <AudioUpload 
                              audioUrl={editForm.audioUrl} 
                              onAudioChange={(url) => setEditForm({...editForm, audioUrl: url})} 
                              className="w-full mt-2" 
                            />`;

const r = `                            <AudioUpload 
                              audioUrl={editForm.audioUrl} 
                              onAudioChange={(url) => setEditForm(prev => ({...prev, audioUrl: url}))}
                              onGenerateAI={editForm.kanji && !editForm.audioUrl ? () => {
                                handleGenerateSingle(editForm.kanji, (url) => {
                                  setEditForm(prev => ({ ...prev, audioUrl: url }));
                                }, 'main-kanji');
                              } : undefined}
                              isGenerating={generatingId === 'main-kanji'}
                              className="w-full mt-2" 
                            />`;

code = code.replace(t, r);
fs.writeFileSync('src/components/VocabList.tsx', code);
