const fs = require('fs');
let content = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

content = content.replace(
  `initialEditId?: string | null;`,
  `initialEditId?: string | null;\n  editCardReq?: { id: string, ts: number } | null;`
);

content = content.replace(
  `initialEditId = null }: VocabListProps`,
  `initialEditId = null, editCardReq = null }: VocabListProps`
);

content = content.replace(
  `  React.useEffect(() => {
    if (initialEditId) {
      const card = deck.find(c => c.id === initialEditId);
      if (card) {
        startEdit(card);
        setSearch(card.kanji || card.reading);
      }
    }
  }, [initialEditId, deck]);`,
  `  React.useEffect(() => {
    const targetId = editCardReq?.id || initialEditId;
    if (targetId) {
      const card = deck.find(c => c.id === targetId);
      if (card) {
        startEdit(card);
        setSearch(card.kanji || card.reading);
      }
    }
  }, [editCardReq, initialEditId, deck]);`
);

fs.writeFileSync('src/components/VocabList.tsx', content);
