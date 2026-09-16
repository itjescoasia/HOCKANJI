const fs = require('fs');

// 1. Patch useVocabDeck.ts
let code1 = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');
code1 = code1.replace(
  /const updateCard = async \(id: string, updates: Partial<KanjiCard>\) => \{\n    if \(!id\) return;\n/,
  `const updateCard = async (id: string, updates: Partial<KanjiCard>) => {
    if (!id) return;
    
    // Check for deleted audio in examples or main word
    const oldCard = deck.find(c => c.id === id);
    if (oldCard) {
       if (updates.audioUrl === null || (updates.audioUrl !== undefined && updates.audioUrl !== oldCard.audioUrl)) {
          if (oldCard.audioUrl) await deleteCloudAudio(oldCard.audioUrl);
       }
       if (updates.examples) {
          const newAudioUrls = new Set(updates.examples.map(ex => ex.audioUrl).filter(Boolean));
          for (const ex of oldCard.examples || []) {
             if (ex.audioUrl && !newAudioUrls.has(ex.audioUrl)) {
                 await deleteCloudAudio(ex.audioUrl);
             }
          }
       }
    }
    
`
);
fs.writeFileSync('src/hooks/useVocabDeck.ts', code1);

// 2. Patch useConversations.ts
let code2 = fs.readFileSync('src/hooks/useConversations.ts', 'utf8');
code2 = code2.replace(
  /const updateConversation = async \(id: string, updates: Partial<Conversation>\) => \{\n    if \(!id\) return;\n/,
  `const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (!id) return;
    
    const oldConv = conversations.find(c => c.id === id);
    if (oldConv) {
       if (updates.audioUrl === null || (updates.audioUrl !== undefined && updates.audioUrl !== oldConv.audioUrl)) {
          if (oldConv.audioUrl) await deleteCloudAudio(oldConv.audioUrl);
       }
       if (updates.dialogues) {
          const newAudioUrls = new Set(updates.dialogues.map(d => d.audioUrl).filter(Boolean));
          for (const dia of oldConv.dialogues || []) {
             if (dia.audioUrl && !newAudioUrls.has(dia.audioUrl)) {
                 await deleteCloudAudio(dia.audioUrl);
             }
          }
       }
    }
    
`
);
fs.writeFileSync('src/hooks/useConversations.ts', code2);

