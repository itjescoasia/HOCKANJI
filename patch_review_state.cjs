const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const targetState = `  const [editForm, setEditForm] = useState<Partial<KanjiCard>>({});`;
const newState = `  const [editForm, setEditForm] = useState<Partial<KanjiCard>>({});
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);`;
content = content.replace(targetState, newState);

fs.writeFileSync('src/components/ReviewSession.tsx', content);
console.log("Patched ReviewSession state");
