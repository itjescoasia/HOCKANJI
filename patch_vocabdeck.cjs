const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');

code = code.replace(/collection\(db, 'users', user\.uid, 'kanjiDeck'\)/g, "collection(db, 'global_kanjiDeck')");
code = code.replace(/doc\(db, 'users', auth\.currentUser!\.uid, 'kanjiDeck',/g, "doc(db, 'global_kanjiDeck',");
code = code.replace(/doc\(db, 'users', auth\.currentUser\.uid, 'kanjiDeck',/g, "doc(db, 'global_kanjiDeck',");

fs.writeFileSync('src/hooks/useVocabDeck.ts', code);
console.log("Patched useVocabDeck successfully.");
