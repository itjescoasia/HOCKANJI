const fs = require('fs');
const content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    if (editingId && editJp.trim()) {
      const existing = conversation.dialogues.find(
        (d) => d.id !== editingId && normalizeSentence(d.japanese) === normalizeSentence(editJp)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      if (!newJp.trim()) {
        setDuplicateWarningId(null);
      }
    }
  }, [editJp, editingId, conversation.dialogues, newJp]);`;

const targetInsert = `  const [editExplanation, setEditExplanation] = useState("");`;

const replacementInsert = `  const [editExplanation, setEditExplanation] = useState("");

  useEffect(() => {
    if (editingId && editJp.trim()) {
      const existing = conversation.dialogues.find(
        (d) => d.id !== editingId && normalizeSentence(d.japanese) === normalizeSentence(editJp)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      if (!newJp.trim()) {
        setDuplicateWarningId(null);
      }
    }
  }, [editJp, editingId, conversation.dialogues, newJp]);`;

let newContent = content.replace(targetEffect, "");
newContent = newContent.replace(targetInsert, replacementInsert);

fs.writeFileSync('src/components/ConversationView.tsx', newContent);
console.log("Success");
