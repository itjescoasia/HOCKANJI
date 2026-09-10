const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  "wordType: card.wordType || '',",
  "wordType: card.wordType || '',\n      audioUrl: card.audioUrl || null,\n      hasAudio: card.hasAudio || !!card.audioUrl,"
);

fs.writeFileSync('src/components/VocabList.tsx', code);
