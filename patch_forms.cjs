const fs = require('fs');
const content = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const target1 = `      const validForms = editForm.forms?.filter(f => f.name.trim() && f.value.trim()).map(f => ({
        id: f.id || crypto.randomUUID(),
        name: f.name.trim(), reading: f.reading?.trim() || "", romaji: f.romaji?.trim() || "",
        value: f.value.trim()
      })) || [];`;
const replacement1 = `      const validForms = editForm.forms?.filter(f => f.name.trim() && f.value.trim()).map(f => ({
        id: f.id || crypto.randomUUID(),
        name: f.name.trim(), reading: f.reading?.trim() || "", romaji: f.romaji?.trim() || "", meaning: f.meaning?.trim() || "",
        value: f.value.trim()
      })) || [];`;

const target2 = `    newForms = [
      { id: crypto.randomUUID(), name: 'Thể lịch sự (thể ます)', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể từ điển (thể る)', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể phủ định (thể ない)', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể て', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể quá khứ (thể た)', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể ý chí (thể よう)', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể mệnh lệnh', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể cấm chỉ (thể な)', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể khả năng', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể sai khiến', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể bị động', value: '', reading: '', romaji: '' },
      { id: crypto.randomUUID(), name: 'Thể bị động sai khiến', value: '', reading: '', romaji: '' }
    ];`;
const replacement2 = `    newForms = [
      { id: crypto.randomUUID(), name: 'Thể lịch sự (thể ます)', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể từ điển (thể る)', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể phủ định (thể ない)', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể て', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể quá khứ (thể た)', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể ý chí (thể よう)', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể mệnh lệnh', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể cấm chỉ (thể な)', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể khả năng', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể sai khiến', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể bị động', value: '', reading: '', romaji: '', meaning: '' },
      { id: crypto.randomUUID(), name: 'Thể bị động sai khiến', value: '', reading: '', romaji: '', meaning: '' }
    ];`;

const target3 = `                                      <div className="flex gap-2">
                                        <input 
                                          value={f.reading || ''} 
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], reading: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-1/2 bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent italic"
                                          placeholder="Hiragana"
                                        />
                                        <input 
                                          value={f.romaji || ''} 
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], romaji: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-1/2 bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent italic"
                                          placeholder="Romaji"
                                        />
                                      </div>`;

const replacement3 = `                                      <div className="flex gap-2">
                                        <input 
                                          value={f.reading || ''} 
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], reading: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-1/3 bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent italic"
                                          placeholder="Hiragana"
                                        />
                                        <input 
                                          value={f.romaji || ''} 
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], romaji: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-1/3 bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent italic"
                                          placeholder="Romaji"
                                        />
                                        <input 
                                          value={f.meaning || ''} 
                                          onChange={e => {
                                            const newForms = [...(editForm.forms || [])];
                                            newForms[index] = { ...newForms[index], meaning: e.target.value };
                                            setEditForm({...editForm, forms: newForms});
                                          }}
                                          className="w-1/3 bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent italic"
                                          placeholder="Nghĩa (Tiếng Việt)"
                                        />
                                      </div>`;

let newContent = content;
if (newContent.includes(target1)) newContent = newContent.replace(target1, replacement1);
else console.log("Target 1 not found");
if (newContent.includes(target2)) newContent = newContent.replace(target2, replacement2);
else console.log("Target 2 not found");
if (newContent.includes(target3)) newContent = newContent.replace(target3, replacement3);
else console.log("Target 3 not found");

fs.writeFileSync('src/components/VocabList.tsx', newContent);
console.log("Success");
