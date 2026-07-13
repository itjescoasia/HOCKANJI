const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const [listSearchQuery, setListSearchQuery] = useState('');
  const lastActivityRef = useRef(Date.now());`;

const newCode = `  const [listSearchQuery, setListSearchQuery] = useState('');
  const [initialEditId, setInitialEditId] = useState<string | null>(null);

  useEffect(() => {
    const handleEditEvent = (e: any) => {
      const card = e.detail;
      setInitialEditId(card.id);
      setListSearchQuery(card.kanji || card.reading);
      setView('list');
    };
    window.addEventListener('editCard', handleEditEvent);
    return () => {
      window.removeEventListener('editCard', handleEditEvent);
    };
  }, []);

  const lastActivityRef = useRef(Date.now());`;

content = content.replace(targetStr, newCode);

// We also need to pass initialEditId to VocabList in App.tsx
// Let's find VocabList rendering
content = content.replace(
  `<VocabList 
          deck={deck} 
          onRemove={deleteCard} 
          onUpdate={updateCard}
          onImport={importCards}
          initialSearchQuery={listSearchQuery}
        />`,
  `<VocabList 
          deck={deck} 
          onRemove={deleteCard} 
          onUpdate={updateCard}
          onImport={importCards}
          initialSearchQuery={listSearchQuery}
          initialEditId={initialEditId}
        />`
);

fs.writeFileSync('src/App.tsx', content);
