const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const t1 = `                            <button
                              type="button"
                              onClick={autoFillAI}`;
const r1 = `                            <AudioUpload 
                              audioUrl={editForm.audioUrl} 
                              onAudioChange={(url) => setEditForm({...editForm, audioUrl: url})} 
                              className="w-full mt-2" 
                            />
                            <button
                              type="button"
                              onClick={autoFillAI}`;

code = code.replace(t1, r1);

const t2 = `                                    <input 
                                      value={editForm.exampleTranslation || ''} 
                                      onChange={e => setEditForm({...editForm, exampleTranslation: e.target.value})}
                                      className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                      placeholder="Dịch nghĩa (Tiếng Việt) - Cũ"
                                    />`;
const r2 = `                                    <input 
                                      value={editForm.exampleTranslation || ''} 
                                      onChange={e => setEditForm({...editForm, exampleTranslation: e.target.value})}
                                      className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                      placeholder="Dịch nghĩa (Tiếng Việt) - Cũ"
                                    />
                                    <AudioUpload 
                                      audioUrl={editForm.audioUrl} 
                                      onAudioChange={(url) => setEditForm({...editForm, audioUrl: url})} 
                                    />`;

code = code.replace(t2, r2);

const t3 = `                                      <div className="grid grid-cols-2 gap-2">
                                        <input 
                                          value={ex.reading || ''}`;
const r3 = `                                      <AudioUpload 
                                        audioUrl={ex.audioUrl} 
                                        onAudioChange={(url) => {
                                          const newExamples = [...(editForm.examples || [])];
                                          newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                          setEditForm({...editForm, examples: newExamples});
                                        }} 
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <input 
                                          value={ex.reading || ''}`;

code = code.replace(t3, r3);

fs.writeFileSync('src/components/VocabList.tsx', code);
