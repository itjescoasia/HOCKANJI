const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const mainAudioOrig = `        if (auth.currentUser) {
          const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversation.id}/audio.mp3\`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          onUpdate(conversation.id, { hasAudio: true, audioUrl: url });
          setAudioUrl(url);
        } else {
          await localforage.setItem(\`audio_\${conversation.id}\`, file);
          const url = URL.createObjectURL(file);
          onUpdate(conversation.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }`;

const mainAudioNew = `        let uploadedToStorage = false;
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

content = content.replace(mainAudioOrig, mainAudioNew);

const sentenceAudioOrig = `        if (auth.currentUser) {
          const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversationId}/audio_\${dialogue.id}.mp3\`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          onUpdateDialogue(dialogue.id, { hasAudio: true, audioUrl: url });
          setAudioUrl(url);
        } else {
          await localforage.setItem(\`audio_\${conversationId}_\${dialogue.id}\`, file);
          const url = URL.createObjectURL(file);
          onUpdateDialogue(dialogue.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }`;

const sentenceAudioNew = `        let uploadedToStorage = false;
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

content = content.replace(sentenceAudioOrig, sentenceAudioNew);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched audio storage handlers");
