const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Patch form
const searchStrForm = `                                          onGenerateAI={f.value && !f.audioUrl ? () => {
                                            handleGenerateSingle(f.value, (url) => {
                                              setEditForm(prev => {
                                                const newForms = [...(prev.forms || [])];
                                                newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                                return { ...prev, forms: newForms };
                                              });
                                            }, \`form-\${index}\`);
                                          } : undefined}`;

const replaceStrForm = `                                          onGenerateAI={f.value && !f.audioUrl ? () => {
                                            handleGenerateSingle(f.value, (url) => {
                                              setEditForm(prev => {
                                                const newForms = [...(prev.forms || [])];
                                                newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                                if (editingId && onUpdate) onUpdate(editingId, { ...prev, forms: newForms });
                                                return { ...prev, forms: newForms };
                                              });
                                            }, \`form-\${index}\`);
                                          } : undefined}`;
code = code.replace(searchStrForm, replaceStrForm);


// Patch old example
const searchStrOldEx = `                                      onGenerateAI={editForm.example && !editForm.audioUrl ? () => {
                                            handleGenerateSingle(editForm.example, (url) => {
                                              setEditForm(prev => ({ ...prev, audioUrl: url }));
                                            }, \`old-example\`);
                                      } : undefined}`;

const replaceStrOldEx = `                                      onGenerateAI={editForm.example && !editForm.audioUrl ? () => {
                                            handleGenerateSingle(editForm.example, (url) => {
                                              setEditForm(prev => {
                                                 if (editingId && onUpdate) onUpdate(editingId, { ...prev, audioUrl: url });
                                                 return { ...prev, audioUrl: url };
                                              });
                                            }, \`old-example\`);
                                      } : undefined}`;
code = code.replace(searchStrOldEx, replaceStrOldEx);


// Patch main kanji
const searchStrMain = `                              onGenerateAI={editForm.kanji && !editForm.audioUrl ? () => {
                                handleGenerateSingle(editForm.kanji, (url) => {
                                  setEditForm(prev => ({ ...prev, audioUrl: url }));
                                }, 'main-kanji');
                              } : undefined}`;

const replaceStrMain = `                              onGenerateAI={editForm.kanji && !editForm.audioUrl ? () => {
                                handleGenerateSingle(editForm.kanji, (url) => {
                                  setEditForm(prev => {
                                     if (editingId && onUpdate) onUpdate(editingId, { ...prev, audioUrl: url });
                                     return { ...prev, audioUrl: url };
                                  });
                                }, 'main-kanji');
                              } : undefined}`;
code = code.replace(searchStrMain, replaceStrMain);


fs.writeFileSync('src/components/VocabList.tsx', code);
