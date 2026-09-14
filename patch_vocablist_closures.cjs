const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// For forms
code = code.replace(
  `                                            handleGenerateSingle(f.value, (url) => {
                                              const newForms = [...(editForm.forms || [])];
                                              newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                              setEditForm({...editForm, forms: newForms});
                                            }, \`form-\${index}\`);`,
  `                                            handleGenerateSingle(f.value, (url) => {
                                              setEditForm(prev => {
                                                const newForms = [...(prev.forms || [])];
                                                newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                                return { ...prev, forms: newForms };
                                              });
                                            }, \`form-\${index}\`);`
);

// For old-example
code = code.replace(
  `                                            handleGenerateSingle(editForm.example, (url) => {
                                              setEditForm({...editForm, audioUrl: url});
                                            }, \`old-example\`);`,
  `                                            handleGenerateSingle(editForm.example, (url) => {
                                              setEditForm(prev => ({ ...prev, audioUrl: url }));
                                            }, \`old-example\`);`
);

// For examples
code = code.replace(
  `                                            handleGenerateSingle(ex.sentence, (url) => {
                                              const newExamples = [...(editForm.examples || [])];
                                              newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                              setEditForm({...editForm, examples: newExamples});
                                            }, \`ex-\${index}\`);`,
  `                                            handleGenerateSingle(ex.sentence, (url) => {
                                              setEditForm(prev => {
                                                const newExamples = [...(prev.examples || [])];
                                                newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                                return { ...prev, examples: newExamples };
                                              });
                                            }, \`ex-\${index}\`);`
);

fs.writeFileSync('src/components/VocabList.tsx', code);
