const fs = require('fs');
let code = fs.readFileSync('src/hooks/useIntensiveVocab.ts', 'utf8');

const searchStr = `  return { intensiveDeck, addWord, removeWord, updateWord, reorderWords, isLoaded };
}`;

const replaceStr = `  useEffect(() => {
    const handleTTSGenerated = async (e: any) => {
      const { text, audioUrl } = e.detail;
      if (!text || !audioUrl) return;

      for (const word of intensiveDeck) {
        let needsUpdate = false;
        let examplesUpdated = false;
        const newExamples = word.examples.map(ex => {
          if (ex.sentence === text && ex.audioUrl !== audioUrl) {
            examplesUpdated = true;
            return { ...ex, audioUrl, hasAudio: true };
          }
          return ex;
        });

        if (examplesUpdated) {
          console.log("Auto-syncing TTS audio to DB for intensive word:", word.word);
          await updateWord(word.id, { examples: newExamples });
        }
      }
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, [intensiveDeck, updateWord]);

  return { intensiveDeck, addWord, removeWord, updateWord, reorderWords, isLoaded };
}`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/hooks/useIntensiveVocab.ts', code);
  console.log("Patched useIntensiveVocab successfully.");
} else {
  console.log("String not found in useIntensiveVocab");
}
