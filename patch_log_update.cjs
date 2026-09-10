const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');

const target = `const cleanedUpdates = removeUndefined(safeUpdates);`;
const replacement = `const cleanedUpdates = removeUndefined(safeUpdates);
        console.log("updateCard CALLED WITH:", id);
        console.log("Raw updates:", updates);
        console.log("Cleaned updates ready for Firestore:", cleanedUpdates);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/hooks/useVocabDeck.ts', code);
