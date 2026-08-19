const fs = require('fs');
const file = 'src/components/VocabList.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'value={search}\n              onChange={e => { setSearch(e.target.value); setVisibleCount(50); }}\n              onChange={(e) => setSearch(e.target.value)}',
  'value={search}\n              onChange={e => { setSearch(e.target.value); setVisibleCount(50); }}'
);

fs.writeFileSync(file, code);
