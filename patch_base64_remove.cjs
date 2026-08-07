const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const mainRemoveOrig = `  const handleRemoveAudio = async () => {
    if (auth.currentUser && conversation.audioUrl) {
      try {
        const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversation.id}/audio.mp3\`);
        await deleteObject(storageRef);
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(\`audio_\${conversation.id}\`);
    }`;

const mainRemoveNew = `  const handleRemoveAudio = async () => {
    if (auth.currentUser && conversation.audioUrl) {
      try {
        if (conversation.audioUrl.startsWith('firestore:')) {
           const audioId = conversation.audioUrl.split(':')[1];
           await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
        } else {
           const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversation.id}/audio.mp3\`);
           await deleteObject(storageRef);
        }
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(\`audio_\${conversation.id}\`);
    }`;

content = content.replace(mainRemoveOrig, mainRemoveNew);

const sentenceRemoveOrig = `  const handleRemoveAudio = async () => {
    if (auth.currentUser && dialogue.audioUrl) {
      try {
        const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversationId}/audio_\${dialogue.id}.mp3\`);
        await deleteObject(storageRef);
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(\`audio_\${conversationId}_\${dialogue.id}\`);
    }`;

const sentenceRemoveNew = `  const handleRemoveAudio = async () => {
    if (auth.currentUser && dialogue.audioUrl) {
      try {
        if (dialogue.audioUrl.startsWith('firestore:')) {
           const audioId = dialogue.audioUrl.split(':')[1];
           await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
        } else {
           const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversationId}/audio_\${dialogue.id}.mp3\`);
           await deleteObject(storageRef);
        }
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(\`audio_\${conversationId}_\${dialogue.id}\`);
    }`;

content = content.replace(sentenceRemoveOrig, sentenceRemoveNew);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched base64 audio remove");
