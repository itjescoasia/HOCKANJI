const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const mainLoadOrig = `    if (conversation.audioUrl) {
      setAudioUrl(conversation.audioUrl);
    } else if (conversation.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversation.id}\`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }`;

const mainLoadNew = `    if (conversation.audioUrl) {
      if (conversation.audioUrl.startsWith('firestore:') && auth.currentUser) {
        const audioId = conversation.audioUrl.split(':')[1];
        getDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId)).then((docSnap) => {
           if (docSnap.exists() && active) {
              setAudioUrl(docSnap.data().data);
           }
        }).catch(err => console.error("Failed to load audio from firestore", err));
      } else {
        setAudioUrl(conversation.audioUrl);
      }
    } else if (conversation.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversation.id}\`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }`;

content = content.replace(mainLoadOrig, mainLoadNew);

const sentenceLoadOrig = `    if (dialogue.audioUrl) {
      setAudioUrl(dialogue.audioUrl);
    } else if (dialogue.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversationId}_\${dialogue.id}\`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }`;

const sentenceLoadNew = `    if (dialogue.audioUrl) {
      if (dialogue.audioUrl.startsWith('firestore:') && auth.currentUser) {
        const audioId = dialogue.audioUrl.split(':')[1];
        getDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId)).then((docSnap) => {
           if (docSnap.exists() && active) {
              setAudioUrl(docSnap.data().data);
           }
        }).catch(err => console.error("Failed to load audio from firestore", err));
      } else {
        setAudioUrl(dialogue.audioUrl);
      }
    } else if (dialogue.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversationId}_\${dialogue.id}\`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }`;

content = content.replace(sentenceLoadOrig, sentenceLoadNew);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched base64 audio load");
