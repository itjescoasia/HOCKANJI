const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const oldEditFormsMap = `
                                <div className="flex flex-col gap-2">
                                  {editForm.forms?.map((f, index) => (
                                    <div key={f.id || index} className="relative flex gap-2">
                                      <input 
                                        value={f.name}
                                        onChange={e => {
                                          const newForms = [...(editForm.forms || [])];
                                          newForms[index] = { ...newForms[index], name: e.target.value };
                                          setEditForm({...editForm, forms: newForms});
                                        }}
                                        className="w-1/3 bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent"
                                        placeholder={formsNamePlaceholder}
                                      />
                                      <input 
                                        value={f.value}
                                        onChange={e => {
                                          const newForms = [...(editForm.forms || [])];
                                          newForms[index] = { ...newForms[index], value: e.target.value };
                                          setEditForm({...editForm, forms: newForms});
                                        }}
                                        className="w-2/3 bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent pr-6"
                                        placeholder={formsValuePlaceholder}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newForms = [...(editForm.forms || [])];
                                          newForms.splice(index, 1);
                                          setEditForm({...editForm, forms: newForms});
                                        }}
                                        className="absolute top-1/2 -translate-y-1/2 right-1 p-1 text-theme-primary/40 hover:text-red-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
`;

const newEditFormsMap = `
                                <div className="flex flex-col gap-2">
                                  {editForm.forms?.map((f, index) => (
                                    <div key={f.id || index} className="relative flex flex-col sm:flex-row gap-2 p-3 border border-theme-subtle/50 rounded bg-theme-panel/30">
                                      <div className="flex-1 space-y-2">
                                        <input 
                                          value={f.name}
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], name: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-full bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary font-bold px-2 py-1.5 focus:outline-none focus:border-theme-accent"
                                          placeholder={formsNamePlaceholder}
                                        />
                                        <input 
                                          value={f.value}
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], value: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent"
                                          placeholder={formsValuePlaceholder}
                                        />
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <input 
                                          value={f.reading || ''}
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], reading: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent"
                                          placeholder="Phát âm (Hiragana)"
                                        />
                                        <input 
                                          value={f.romaji || ''}
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], romaji: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent"
                                          placeholder="Phát âm (Romaji)"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newForms = [...(editForm.forms || [])];
                                          newForms.splice(index, 1);
                                          setEditForm({...editForm, forms: newForms});
                                        }}
                                        className="absolute top-1 right-1 p-1 text-theme-primary/40 hover:text-red-500 bg-theme-base rounded-full"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
`;

code = code.replace(oldEditFormsMap.trim(), newEditFormsMap.trim());
fs.writeFileSync('src/components/VocabList.tsx', code);
