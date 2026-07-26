const fs = require('fs');

let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// 1. Add ArrowRightLeft import
content = content.replace(
  'ArrowRight } from "lucide-react";',
  'ArrowRight, ArrowRightLeft } from "lucide-react";'
);

// 2. Add conversations to ConversationDetail parameters
content = content.replace(
  'function ConversationDetail({\n  conversation,',
  'function ConversationDetail({\n  conversation,\n  conversations,'
);

content = content.replace(
  '}: {\n  conversation: Conversation;',
  '}: {\n  conversation: Conversation;\n  conversations: Conversation[];'
);

// 3. Add movingDialogueId state and handleMoveDialogue
const stateInsertion = `
  const [movingDialogueId, setMovingDialogueId] = useState<string | null>(null);

  const handleMoveDialogue = (dialogue: DialogueSentence, targetConversationId: string) => {
    if (!targetConversationId) return;
    const targetConv = conversations.find(c => c.id === targetConversationId);
    if (!targetConv) return;
    
    // update target
    onUpdate(targetConv.id, {
      dialogues: [...targetConv.dialogues, dialogue]
    });
    // update source
    onUpdate(conversation.id, {
      dialogues: conversation.dialogues.filter(d => d.id !== dialogue.id)
    });
    setMovingDialogueId(null);
  };
`;
content = content.replace(
  'const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);',
  'const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);' + stateInsertion
);

// 4. Update the ConversationDetail call in ConversationView component
content = content.replace(
  '<ConversationDetail\n            conversation={selectedConv}',
  '<ConversationDetail\n            conversations={conversations}\n            conversation={selectedConv}'
);

fs.writeFileSync('src/components/ConversationView.tsx', content);
