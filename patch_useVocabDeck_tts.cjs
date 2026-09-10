const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');

const effectCode = `
  useEffect(() => {
    const handleTTSGenerated = async (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string, audioUrl: string }>;
      const { text, audioUrl } = customEvent.detail;
      
      // We don't want to scan if there's no deck or user
      if (!deck || deck.length === 0) return;
      
      // Find cards to update
      for (const card of deck) {
         let needsUpdate = false;
         let updates: Partial<KanjiCard> = {};
         
         if ((card.kanji === text || card.reading === text) && card.audioUrl !== audioUrl) {
            updates.audioUrl = audioUrl;
            updates.hasAudio = true;
            needsUpdate = true;
         }
         
         if (card.examples) {
            let examplesUpdated = false;
            const newExamples = card.examples.map(ex => {
               if (ex.sentence === text && ex.audioUrl !== audioUrl) {
                  examplesUpdated = true;
                  return { ...ex, audioUrl, hasAudio: true };
               }
               return ex;
            });
            if (examplesUpdated) {
               updates.examples = newExamples;
               needsUpdate = true;
            }
         }
         
         if (card.forms) {
            let formsUpdated = false;
            const newForms = card.forms.map(form => {
               if (form.value === text && form.audioUrl !== audioUrl) {
                  formsUpdated = true;
                  return { ...form, audioUrl, hasAudio: true };
               }
               return form;
            });
            if (formsUpdated) {
               updates.forms = newForms;
               needsUpdate = true;
            }
         }
         
         if (needsUpdate) {
            console.log("Auto-syncing TTS audio to DB for card:", card.kanji || card.reading);
            await updateCard(card.id, updates);
         }
      }
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, [deck, updateCard]);
`;

code = code.replace(
  "return { deck, addCard, removeCard, updateCard, reviewCard, getDueCards, importCards, isLoaded };",
  effectCode + "\n  return { deck, addCard, removeCard, updateCard, reviewCard, getDueCards, importCards, isLoaded };"
);

fs.writeFileSync('src/hooks/useVocabDeck.ts', code);
