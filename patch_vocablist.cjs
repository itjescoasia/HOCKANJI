const fs = require('fs');
let content = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Update Props Interface
content = content.replace(
  `  initialSearchQuery?: string;\n}`,
  `  initialSearchQuery?: string;\n  initialEditId?: string | null;\n}`
);

// Update component signature
content = content.replace(
  `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '' }: VocabListProps) {`,
  `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', initialEditId = null }: VocabListProps) {`
);

// Insert useEffect after startEdit
const startEditEnd = `    });\n  };`;
const useEffectCode = `    });\n  };\n\n  React.useEffect(() => {\n    if (initialEditId) {\n      const card = deck.find(c => c.id === initialEditId);\n      if (card) {\n        startEdit(card);\n        setSearch(card.kanji || card.reading);\n      }\n    }\n  }, [initialEditId, deck]);`;

content = content.replace(startEditEnd, useEffectCode);

fs.writeFileSync('src/components/VocabList.tsx', content);
