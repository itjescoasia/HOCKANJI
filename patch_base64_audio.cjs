const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// Add doc, setDoc, getDoc, deleteDoc to firestore imports if missing
if (!content.includes('setDoc')) {
    content = content.replace("import { doc, collection, query, where, getDocs, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';",
    "import { doc, collection, query, where, getDocs, writeBatch, arrayUnion, arrayRemove, setDoc, getDoc, deleteDoc } from 'firebase/firestore';");
}

const fileToBase64 = `
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
`;

if (!content.includes('fileToBase64')) {
    content = content.replace('export default function ConversationView', fileToBase64 + '\nexport default function ConversationView');
}

const mainAudioOrig = `        let uploadedToStorage = false;
        if (auth.currentUser) {
          try {
            const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversation.id}/audio.mp3\`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            onUpdate(conversation.id, { hasAudio: true, audioUrl: url });
            setAudioUrl(url);
            uploadedToStorage = true;
          } catch (storageErr) {
            console.warn("Storage upload failed, falling back to local", storageErr);
          }
        }
        
        if (!uploadedToStorage) {
          await localforage.setItem(\`audio_\${conversation.id}\`, file);
          const url = URL.createObjectURL(file);
          onUpdate(conversation.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }`;

const mainAudioNew = `        let uploadedToStorage = false;
        if (auth.currentUser) {
          try {
            const base64 = await fileToBase64(file);
            // Save to Firestore instead of Storage
            const audioDocRef = doc(db, 'users', auth.currentUser.uid, 'audio', conversation.id);
            await setDoc(audioDocRef, { data: base64, createdAt: Date.now() });
            onUpdate(conversation.id, { hasAudio: true, audioUrl: 'firestore:' + conversation.id });
            setAudioUrl(base64);
            uploadedToStorage = true;
          } catch (storageErr) {
            console.warn("Firestore audio upload failed, falling back to local", storageErr);
          }
        }
        
        if (!uploadedToStorage) {
          await localforage.setItem(\`audio_\${conversation.id}\`, file);
          const url = URL.createObjectURL(file);
          onUpdate(conversation.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }`;

content = content.replace(mainAudioOrig, mainAudioNew);

const sentenceAudioOrig = `        let uploadedToStorage = false;
        if (auth.currentUser) {
          try {
            const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversationId}/audio_\${dialogue.id}.mp3\`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            onUpdateDialogue(dialogue.id, { hasAudio: true, audioUrl: url });
            setAudioUrl(url);
            uploadedToStorage = true;
          } catch (storageErr) {
            console.warn("Storage upload failed, falling back to local", storageErr);
          }
        }
        
        if (!uploadedToStorage) {
          await localforage.setItem(\`audio_\${conversationId}_\${dialogue.id}\`, file);
          const url = URL.createObjectURL(file);
          onUpdateDialogue(dialogue.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }`;

const sentenceAudioNew = `        let uploadedToStorage = false;
        if (auth.currentUser) {
          try {
            const base64 = await fileToBase64(file);
            const audioId = \`\${conversationId}_\${dialogue.id}\`;
            const audioDocRef = doc(db, 'users', auth.currentUser.uid, 'audio', audioId);
            await setDoc(audioDocRef, { data: base64, createdAt: Date.now() });
            onUpdateDialogue(dialogue.id, { hasAudio: true, audioUrl: 'firestore:' + audioId });
            setAudioUrl(base64);
            uploadedToStorage = true;
          } catch (storageErr) {
            console.warn("Firestore audio upload failed, falling back to local", storageErr);
          }
        }
        
        if (!uploadedToStorage) {
          await localforage.setItem(\`audio_\${conversationId}_\${dialogue.id}\`, file);
          const url = URL.createObjectURL(file);
          onUpdateDialogue(dialogue.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }`;

content = content.replace(sentenceAudioOrig, sentenceAudioNew);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched base64 audio upload");
