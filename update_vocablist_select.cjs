const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const oldSelect = `onChange={e => setEditForm({...editForm, wordType: e.target.value})}`;
const newSelect = `onChange={e => {
  const newWordType = e.target.value;
  let newForms = editForm.forms || [];
  if (newWordType.includes('Động từ') && newForms.length === 0) {
    newForms = [
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
    ];
  }
  setEditForm({...editForm, wordType: newWordType, forms: newForms});
}}`;

code = code.replace(oldSelect, newSelect);
fs.writeFileSync('src/components/VocabList.tsx', code);
