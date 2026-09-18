const fs = require('fs');
let code = fs.readFileSync('src/hooks/useIntensiveVocab.ts', 'utf8');

code = code.replace(/collection\(db, 'users', user\.uid, 'intensiveVocab'\)/g, "collection(db, 'global_intensiveVocab')");
code = code.replace(/doc\(db, 'users', auth\.currentUser!\.uid, 'intensiveVocab',/g, "doc(db, 'global_intensiveVocab',");
code = code.replace(/doc\(db, 'users', auth\.currentUser\.uid, 'intensiveVocab',/g, "doc(db, 'global_intensiveVocab',");

fs.writeFileSync('src/hooks/useIntensiveVocab.ts', code);
console.log("Patched useIntensiveVocab successfully.");
