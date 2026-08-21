const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetStr = `                                          placeholder="Nghĩa (Tiếng Việt)"
                                        />
                                      </div>
                                    </div>
                                  ))}`;

const replacementStr = `                                          placeholder="Nghĩa (Tiếng Việt)"
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <AudioUpload 
                                          audioUrl={f.audioUrl} 
                                          onAudioChange={(url) => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/VocabList.tsx', code);
