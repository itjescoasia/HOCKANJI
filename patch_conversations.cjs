const fs = require('fs');
let code = fs.readFileSync('src/hooks/useConversations.ts', 'utf8');

code = code.replace(/import \{ db, auth, removeUndefined \} from '\.\.\/lib\/firebase';/, "import { db, auth, removeUndefined } from '../lib/firebase';\nimport { deleteCloudAudio } from '../utils/playTTS';");

const oldRemove = `  const removeConversation = async (id: string) => {
    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/conversations/\${id}\`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  };`;

const newRemove = `  const removeConversation = async (id: string) => {
    const convoToDelete = conversations.find(c => c.id === id);
    if (convoToDelete) {
      if (convoToDelete.audioUrl) await deleteCloudAudio(convoToDelete.audioUrl);
      if (convoToDelete.dialogues && Array.isArray(convoToDelete.dialogues)) {
        for (const dia of convoToDelete.dialogues) {
          if (dia.audioUrl) await deleteCloudAudio(dia.audioUrl);
        }
      }
    }

    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/conversations/\${id}\`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  };`;
code = code.replace(oldRemove, newRemove);

const oldUpdate = `  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (!id) return;
    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/conversations/\${id}\`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', id), removeUndefined(updates), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };`;

const newUpdate = `  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (!id) return;
    
    const oldConvo = conversations.find(c => c.id === id);
    if (oldConvo) {
       if (updates.audioUrl === null || (updates.audioUrl !== undefined && updates.audioUrl !== oldConvo.audioUrl)) {
          if (oldConvo.audioUrl) await deleteCloudAudio(oldConvo.audioUrl);
       }
       if (updates.dialogues) {
          const newAudioUrls = new Set(updates.dialogues.map(d => d.audioUrl).filter(Boolean));
          for (const dia of oldConvo.dialogues || []) {
             if (dia.audioUrl && !newAudioUrls.has(dia.audioUrl)) {
                 await deleteCloudAudio(dia.audioUrl);
             }
          }
       }
    }

    if (auth.currentUser) {
      const path = \`users/\${auth.currentUser.uid}/conversations/\${id}\`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', id), removeUndefined(updates), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };`;
code = code.replace(oldUpdate, newUpdate);

fs.writeFileSync('src/hooks/useConversations.ts', code);
