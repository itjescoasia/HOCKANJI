const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

code = code.replace("import { storage, auth } from '../lib/firebase';", "import { storage, auth, db } from '../lib/firebase';\nimport { doc, deleteDoc } from 'firebase/firestore';");

const oldDeleteFn = `export const deleteCloudAudio = async (url?: string | null) => {
  if (!url || typeof url !== 'string' || !url.includes('firebasestorage.googleapis.com')) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    console.log("Deleted old audio from cloud:", url);
  } catch (err) {
    console.warn("Failed to delete cloud audio:", err);
  }
};`;

const newDeleteFn = `export const deleteCloudAudio = async (url?: string | null) => {
  if (!url || typeof url !== 'string') return;
  
  try {
    if (url.startsWith('firestore:') && auth.currentUser) {
       const audioId = url.split(':')[1];
       await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
       console.log("Deleted old audio from firestore:", url);
       return;
    }
    
    if (url.includes('firebasestorage.googleapis.com')) {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      console.log("Deleted old audio from cloud storage:", url);
    }
  } catch (err) {
    console.warn("Failed to delete cloud audio:", err);
  }
};`;

code = code.replace(oldDeleteFn, newDeleteFn);
fs.writeFileSync('src/utils/playTTS.ts', code);
