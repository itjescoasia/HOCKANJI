const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const targetState = `  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);`;
const newState = `  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [editingExampleId, setEditingExampleId] = useState<string | null>(null);
  const [editExampleForm, setEditExampleForm] = useState<{ sentence: string; translation?: string; reading?: string; romaji?: string }>({ sentence: "" });`;

content = content.replace(targetState, newState);

fs.writeFileSync('src/components/ReviewSession.tsx', content);
console.log("Patched ReviewSession state");
