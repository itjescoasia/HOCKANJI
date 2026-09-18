const fs = require('fs');
let code = fs.readFileSync('src/hooks/useConversations.ts', 'utf8');

code = code.replace(/collection\(db, 'users', user\.uid, 'conversations'\)/g, "collection(db, 'global_conversations')");
code = code.replace(/doc\(db, 'users', auth\.currentUser!\.uid, 'conversations',/g, "doc(db, 'global_conversations',");
code = code.replace(/doc\(db, 'users', auth\.currentUser\.uid, 'conversations',/g, "doc(db, 'global_conversations',");

fs.writeFileSync('src/hooks/useConversations.ts', code);
console.log("Patched useConversations successfully.");
