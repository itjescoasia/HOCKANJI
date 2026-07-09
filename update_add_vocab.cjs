const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

code = code.replace(
  'forms?: { id: string, name: string, value: string }[]',
  'forms?: { id: string, name: string, value: string, reading?: string, romaji?: string }[]'
);

code = code.replace(
  'const [forms, setForms] = useState<{name: string, value: string}[]>([]);',
  'const [forms, setForms] = useState<{name: string, value: string, reading: string, romaji: string}[]>([]);'
);

code = code.replace(
  'const handleWordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {',
  `const handleWordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {` // Wait, handleWordTypeChange doesn't exist yet, we only have onChange={e => setWordType(e.target.value)} inline.
);

fs.writeFileSync('src/components/AddVocab.tsx', code);
