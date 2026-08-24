const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `const [editCardReq, setEditCardReq] = useState<{id: string, ts: number} | null>(null);`;
const replacementState = `const [editCardReq, setEditCardReq] = useState<{id: string, ts: number} | null>(null);
  const [viewCardReq, setViewCardReq] = useState<{id: string, ts: number} | null>(null);`;

code = code.replace(targetState, replacementState);

const targetEffect = `window.addEventListener('editCard', handleEditEvent);
    return () => {
      window.removeEventListener('editCard', handleEditEvent);
    };`;
const replacementEffect = `window.addEventListener('editCard', handleEditEvent);
    const handleViewEvent = (e: any) => {
      const card = e.detail;
      setViewCardReq({ id: card.id, ts: Date.now() });
      setListSearchQuery(card.kanji || card.reading);
      setView('list');
    };
    window.addEventListener('viewCard', handleViewEvent);
    return () => {
      window.removeEventListener('editCard', handleEditEvent);
      window.removeEventListener('viewCard', handleViewEvent);
    };`;

code = code.replace(targetEffect, replacementEffect);

// And pass it to VocabList
const targetProps = `initialEditId={editCardReq?.id} editCardReq={editCardReq}`;
const replacementProps = `initialEditId={editCardReq?.id} editCardReq={editCardReq} viewCardReq={viewCardReq}`;

code = code.replace(/initialEditId=\{editCardReq\?\.id\} editCardReq=\{editCardReq\}/g, replacementProps);

fs.writeFileSync('src/App.tsx', code);
