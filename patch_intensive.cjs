const fs = require('fs');
let code = fs.readFileSync('src/hooks/useIntensiveVocab.ts', 'utf8');

// Add import
code = code.replace(/import \{ db, auth, removeUndefined \} from '\.\.\/lib\/firebase';/, "import { db, auth, removeUndefined } from '../lib/firebase';\nimport { deleteCloudAudio } from '../utils/playTTS';");

const oldRemove = `  const removeWord = async (id: string) => {
    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/intensiveVocab/\${id}\`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setIntensiveDeck(prev => prev.filter(c => c.id !== id));
    }
  };`;

const newRemove = `  const removeWord = async (id: string) => {
    const wordToDelete = intensiveDeck.find(w => w.id === id);
    if (wordToDelete) {
      if (wordToDelete.audioUrl) await deleteCloudAudio(wordToDelete.audioUrl);
      if (wordToDelete.examples && Array.isArray(wordToDelete.examples)) {
        for (const ex of wordToDelete.examples) {
          if (ex.audioUrl) await deleteCloudAudio(ex.audioUrl);
        }
      }
    }

    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/intensiveVocab/\${id}\`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setIntensiveDeck(prev => prev.filter(c => c.id !== id));
    }
  };`;

code = code.replace(oldRemove, newRemove);

const oldUpdate = `  const updateWord = async (id: string, updates: Partial<IntensiveWord>) => {
    if (!id) return;
    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/intensiveVocab/\${id}\`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', id), removeUndefined(updates), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setIntensiveDeck(prev => prev.map(word => word.id === id ? { ...word, ...updates } : word));
    }
  };`;

const newUpdate = `  const updateWord = async (id: string, updates: Partial<IntensiveWord>) => {
    if (!id) return;
    
    // Check for deleted audio in examples or main word
    const oldWord = intensiveDeck.find(w => w.id === id);
    if (oldWord) {
       if (updates.audioUrl === null || (updates.audioUrl !== undefined && updates.audioUrl !== oldWord.audioUrl)) {
          if (oldWord.audioUrl) await deleteCloudAudio(oldWord.audioUrl);
       }
       if (updates.examples) {
          const newAudioUrls = new Set(updates.examples.map(ex => ex.audioUrl).filter(Boolean));
          for (const ex of oldWord.examples || []) {
             if (ex.audioUrl && !newAudioUrls.has(ex.audioUrl)) {
                 await deleteCloudAudio(ex.audioUrl);
             }
          }
       }
    }

    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/intensiveVocab/\${id}\`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', id), removeUndefined(updates), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setIntensiveDeck(prev => prev.map(word => word.id === id ? { ...word, ...updates } : word));
    }
  };`;

code = code.replace(oldUpdate, newUpdate);

fs.writeFileSync('src/hooks/useIntensiveVocab.ts', code);
