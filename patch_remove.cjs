const fs = require('fs');

// Patch useVocabDeck.ts
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');
code = code.replace(
  /if \(auth\.currentUser\) \{\s*try \{\s*await deleteDoc\(doc\(db, 'users', auth\.currentUser\.uid, 'kanjiDeck', id\)\);\s*\} catch \(err\) \{\s*console\.error\("Error removing card:", err\);\s*\}\s*\} else \{\s*setDeck\(prev => prev\.filter\(c => c\.id !== id\)\);\s*\}/,
  `// Optimistic UI update
    setDeck(prev => prev.filter(c => c.id !== id));
    
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id));
      } catch (err) {
        console.error("Error removing card:", err);
      }
    }`
);
fs.writeFileSync('src/hooks/useVocabDeck.ts', code);

// Patch useIntensiveVocab.ts
let code2 = fs.readFileSync('src/hooks/useIntensiveVocab.ts', 'utf8');
code2 = code2.replace(
  /if \(auth\.currentUser\) \{\s*const path = \`users\/\$\{auth\.currentUser\.uid\}\/intensiveVocab\/\$\{id\}\`;\s*try \{\s*await deleteDoc\(doc\(db, 'users', auth\.currentUser\.uid, 'intensiveVocab', id\)\);\s*\} catch \(err\) \{\s*handleFirestoreError\(err, OperationType\.DELETE, path\);\s*\}\s*\} else \{\s*setIntensiveDeck\(prev => prev\.filter\(c => c\.id !== id\)\);\s*\}/,
  `// Optimistic UI update
    setIntensiveDeck(prev => prev.filter(c => c.id !== id));
    
    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/intensiveVocab/\${id}\`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }`
);
fs.writeFileSync('src/hooks/useIntensiveVocab.ts', code2);

// Patch useConversations.ts
let code3 = fs.readFileSync('src/hooks/useConversations.ts', 'utf8');
code3 = code3.replace(
  /if \(auth\.currentUser\) \{\s*try \{\s*await deleteDoc\(doc\(db, 'users', auth\.currentUser\.uid, 'conversations', id\)\);\s*\} catch \(err\) \{\s*console\.error\("Error deleting conversation:", err\);\s*\}\s*\} else \{\s*setConversations\(prev => prev\.filter\(c => c\.id !== id\)\);\s*\}/,
  `// Optimistic UI update
    setConversations(prev => prev.filter(c => c.id !== id));
    
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', id));
      } catch (err) {
        console.error("Error deleting conversation:", err);
      }
    }`
);
fs.writeFileSync('src/hooks/useConversations.ts', code3);

