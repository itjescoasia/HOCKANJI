const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

// replace the inline setWordType with a custom function
code = code.replace(
  'onChange={e => setWordType(e.target.value)}',
  'onChange={handleWordTypeChange}'
);

const handleWordTypeChangeFn = `
  const handleWordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWordType = e.target.value;
    setWordType(newWordType);
    if (newWordType.includes('Động từ')) {
      if (forms.length === 0) {
        setForms([
          { name: 'Thể lịch sự (thể ます)', value: '', reading: '', romaji: '' },
          { name: 'Thể từ điển (thể る)', value: '', reading: '', romaji: '' },
          { name: 'Thể phủ định (thể ない)', value: '', reading: '', romaji: '' },
          { name: 'Thể て', value: '', reading: '', romaji: '' },
          { name: 'Thể quá khứ (thể た)', value: '', reading: '', romaji: '' },
          { name: 'Thể ý chí (thể よう)', value: '', reading: '', romaji: '' },
          { name: 'Thể mệnh lệnh', value: '', reading: '', romaji: '' },
          { name: 'Thể cấm chỉ (thể な)', value: '', reading: '', romaji: '' },
          { name: 'Thể khả năng', value: '', reading: '', romaji: '' },
          { name: 'Thể sai khiến', value: '', reading: '', romaji: '' },
          { name: 'Thể bị động', value: '', reading: '', romaji: '' },
          { name: 'Thể bị động sai khiến', value: '', reading: '', romaji: '' }
        ]);
      }
    }
  };
`;

// Insert the function before handleSubmit
code = code.replace(
  'const handleSubmit = (e: React.FormEvent) => {',
  handleWordTypeChangeFn + '\n  const handleSubmit = (e: React.FormEvent) => {'
);

fs.writeFileSync('src/components/AddVocab.tsx', code);
