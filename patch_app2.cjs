const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `<VocabList deck={deck} onRemove={removeCard} onUpdate={updateCard} onImport={importCards} initialSearchQuery={listSearchQuery} />`,
  `<VocabList deck={deck} onRemove={removeCard} onUpdate={updateCard} onImport={importCards} initialSearchQuery={listSearchQuery} initialEditId={initialEditId} />`
);

fs.writeFileSync('src/App.tsx', content);
