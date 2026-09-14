const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');

const t1 = `        // CLEANUP: Tự động xóa các file base64 quá lớn ra khỏi object update để tránh lỗi 1MB
        let safeUpdates = JSON.parse(JSON.stringify(updates));
        if (safeUpdates.audioUrl && safeUpdates.audioUrl.startsWith('data:audio')) {
           safeUpdates.audioUrl = null;
        }
        if (safeUpdates.examples) {
           safeUpdates.examples = safeUpdates.examples.map(ex => {
              if (ex.audioUrl && ex.audioUrl.startsWith('data:audio')) {
                 return { ...ex, audioUrl: null };
              }
              return ex;
           });
        }
        if (safeUpdates.forms) {
           safeUpdates.forms = safeUpdates.forms.map(f => {
              if (f.audioUrl && f.audioUrl.startsWith('data:audio')) {
                 return { ...f, audioUrl: null };
              }
              return f;
           });
        }
        
        await updateDoc(doc(db, \`users/\${auth.currentUser.uid}/deck\`, id), {
          ...safeUpdates,
          updatedAt: Date.now()
        });`;

const r1 = `        let safeUpdates = JSON.parse(JSON.stringify(updates));
        
        await updateDoc(doc(db, \`users/\${auth.currentUser.uid}/deck\`, id), {
          ...safeUpdates,
          updatedAt: Date.now()
        });`;

code = code.replace(t1, r1);
fs.writeFileSync('src/hooks/useVocabDeck.ts', code);
