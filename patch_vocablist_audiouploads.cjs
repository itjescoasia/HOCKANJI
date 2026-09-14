const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// For forms:
const t1 = `                                        <AudioUpload 
                                          audioUrl={f.audioUrl} 
                                          onAudioChange={(url) => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                        />`;

const r1 = `                                        <AudioUpload 
                                          audioUrl={f.audioUrl} 
                                          onAudioChange={(url) => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          onGenerateAI={f.value && !f.audioUrl ? () => {
                                            handleGenerateSingle(f.value, (url) => {
                                              const newForms = [...(editForm.forms || [])];
                                              newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                              setEditForm({...editForm, forms: newForms});
                                            }, \`form-\${index}\`);
                                          } : undefined}
                                          isGenerating={generatingId === \`form-\${index}\`}
                                        />`;
code = code.replace(t1, r1);

// For old example:
const t2 = `                                    <AudioUpload 
                                      audioUrl={editForm.audioUrl} 
                                      onAudioChange={(url) => setEditForm({...editForm, audioUrl: url})} 
                                    />`;

const r2 = `                                    <AudioUpload 
                                      audioUrl={editForm.audioUrl} 
                                      onAudioChange={(url) => setEditForm({...editForm, audioUrl: url})} 
                                      onGenerateAI={editForm.example && !editForm.audioUrl ? () => {
                                            handleGenerateSingle(editForm.example, (url) => {
                                              setEditForm({...editForm, audioUrl: url});
                                            }, \`old-example\`);
                                      } : undefined}
                                      isGenerating={generatingId === \`old-example\`}
                                    />`;
code = code.replace(t2, r2);

// For examples:
const t3 = `                                      <AudioUpload 
                                        audioUrl={ex.audioUrl} 
                                        onAudioChange={(url) => {
                                          const newExamples = [...(editForm.examples || [])];
                                          newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                          setEditForm({...editForm, examples: newExamples});
                                        }} 
                                      />`;

const r3 = `                                      <AudioUpload 
                                        audioUrl={ex.audioUrl} 
                                        onAudioChange={(url) => {
                                          const newExamples = [...(editForm.examples || [])];
                                          newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                          setEditForm({...editForm, examples: newExamples});
                                        }} 
                                        onGenerateAI={ex.sentence && !ex.audioUrl ? () => {
                                            handleGenerateSingle(ex.sentence, (url) => {
                                              const newExamples = [...(editForm.examples || [])];
                                              newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                              setEditForm({...editForm, examples: newExamples});
                                            }, \`ex-\${index}\`);
                                          } : undefined}
                                        isGenerating={generatingId === \`ex-\${index}\`}
                                      />`;
code = code.replace(t3, r3);

fs.writeFileSync('src/components/VocabList.tsx', code);
