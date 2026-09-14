const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

// For main-word
code = code.replace(
  `            onGenerateAI={formData.kanji && !formData.audioUrl ? () => {
                handleGenerateSingle(formData.kanji, (url) => {
                    setFormData({...formData, audioUrl: url});
                }, 'main-word');
            } : undefined}`,
  `            onGenerateAI={formData.kanji && !formData.audioUrl ? () => {
                handleGenerateSingle(formData.kanji, (url) => {
                    setFormData(prev => ({...prev, audioUrl: url}));
                }, 'main-word');
            } : undefined}`
);

fs.writeFileSync('src/components/AddVocab.tsx', code);
