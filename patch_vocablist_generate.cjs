const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const searchStr = `                                        onGenerateAI={ex.sentence && !ex.audioUrl ? () => {
                                            handleGenerateSingle(ex.sentence, (url) => {
                                              setEditForm(prev => {
                                                const newExamples = [...(prev.examples || [])];
                                                newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                                return { ...prev, examples: newExamples };
                                              });
                                            }, \`ex-\${index}\`);
                                          } : undefined}`;

const replaceStr = `                                        onGenerateAI={ex.sentence && !ex.audioUrl ? () => {
                                            handleGenerateSingle(ex.sentence, (url) => {
                                              setEditForm(prev => {
                                                const newExamples = [...(prev.examples || [])];
                                                newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                                
                                                // Tự động lưu ngay lập tức vào DB
                                                if (editingId && onUpdate) {
                                                   onUpdate(editingId, { ...prev, examples: newExamples });
                                                }
                                                
                                                return { ...prev, examples: newExamples };
                                              });
                                            }, \`ex-\${index}\`);
                                          } : undefined}`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync('src/components/VocabList.tsx', code);
    console.log("Patched example AI generate in VocabList");
} else {
    console.log("Could not find the target string.");
}
