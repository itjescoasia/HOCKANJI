const fs = require('fs');
let code = fs.readFileSync('src/hooks/useConversations.ts', 'utf8');

const cleanupLogic = `
  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (!id) return;
    if (auth.currentUser) {
      try {
        let safeUpdates = JSON.parse(JSON.stringify(updates));
        if (safeUpdates.dialogues) {
           safeUpdates.dialogues = safeUpdates.dialogues.map(d => {
              if (d.audioUrl && d.audioUrl.startsWith('data:audio')) {
                 return { ...d, audioUrl: null };
              }
              return d;
           });
        }
        
        const cleanedUpdates = removeUndefined(safeUpdates);
`;

code = code.replace(
  `  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (!id) return;
    if (auth.currentUser) {
      try {
        const cleanedUpdates = removeUndefined(updates);`,
  cleanupLogic
);

fs.writeFileSync('src/hooks/useConversations.ts', code);
