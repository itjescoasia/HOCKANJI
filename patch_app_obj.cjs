const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `const [initialEditId, setInitialEditId] = useState<string | null>(null);`,
  `const [editCardReq, setEditCardReq] = useState<{id: string, ts: number} | null>(null);`
);

content = content.replace(
  `setInitialEditId(card.id);`,
  `setEditCardReq({ id: card.id, ts: Date.now() });`
);

content = content.replace(
  `initialEditId={initialEditId}`,
  `initialEditId={editCardReq?.id}`
);

fs.writeFileSync('src/App.tsx', content);
