const fs = require('fs');
let code = fs.readFileSync('src/hooks/useConversations.ts', 'utf8');

const effectCode = `
  useEffect(() => {
    const handleTTSGenerated = async (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string, audioUrl: string }>;
      const { text, audioUrl } = customEvent.detail;
      
      if (!conversations || conversations.length === 0) return;
      
      for (const conv of conversations) {
         let needsUpdate = false;
         let updates: Partial<Conversation> = {};
         
         if (conv.dialogues) {
            let dialoguesUpdated = false;
            const newDialogues = conv.dialogues.map(d => {
               if (d.japanese === text && d.audioUrl !== audioUrl) {
                  dialoguesUpdated = true;
                  return { ...d, audioUrl, hasAudio: true };
               }
               return d;
            });
            if (dialoguesUpdated) {
               updates.dialogues = newDialogues;
               needsUpdate = true;
            }
         }
         
         if (needsUpdate) {
            console.log("Auto-syncing TTS audio to DB for conversation:", conv.title);
            await updateConversation(conv.id, updates);
         }
      }
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, [conversations, updateConversation]);
`;

code = code.replace(
  "return { conversations, addConversation, removeConversation, updateConversation, isLoaded };",
  effectCode + "\n  return { conversations, addConversation, removeConversation, updateConversation, isLoaded };"
);

fs.writeFileSync('src/hooks/useConversations.ts', code);
