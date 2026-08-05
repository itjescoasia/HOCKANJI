const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// 1. Imports
content = content.replace(
  "import { auth } from '../lib/firebase';",
  "import { auth, storage } from '../lib/firebase';\nimport { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';"
);

// 2. ConversationView audio logic
const convUseEffectTarget = `  useEffect(() => {
    if (conversation.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversation.id}\`).then((blob) => {
        if (blob) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [conversation.id, conversation.hasAudio]);`;

const convUseEffectReplace = `  useEffect(() => {
    let active = true;
    if (conversation.audioUrl) {
      setAudioUrl(conversation.audioUrl);
    } else if (conversation.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversation.id}\`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }
    return () => {
      active = false;
    };
  }, [conversation.id, conversation.hasAudio, conversation.audioUrl]);`;
content = content.replace(convUseEffectTarget, convUseEffectReplace);

const convUploadTarget = `  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      await localforage.setItem(\`audio_\${conversation.id}\`, file);
      setAudioUrl(URL.createObjectURL(file));
      onUpdate(conversation.id, { hasAudio: true });
    }
    if (e.target) {
        e.target.value = '';
    }
  };`;

const convUploadReplace = `  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setIsUploadingAudio(true);
      try {
        if (auth.currentUser) {
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
        }
      } catch (err) {
        console.error("Upload error", err);
      }
      setIsUploadingAudio(false);
    }
    if (e.target) {
        e.target.value = '';
    }
  };`;
content = content.replace(convUploadTarget, convUploadReplace);

const convRemoveTarget = `  const handleRemoveAudio = async () => {
    await localforage.removeItem(\`audio_\${conversation.id}\`);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdate(conversation.id, { hasAudio: false });
  };`;

const convRemoveReplace = `  const handleRemoveAudio = async () => {
    if (auth.currentUser && conversation.audioUrl) {
      try {
        const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversation.id}/audio.mp3\`);
        await deleteObject(storageRef);
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(\`audio_\${conversation.id}\`);
    }
    if (audioUrl && !audioUrl.startsWith('http')) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdate(conversation.id, { hasAudio: false, audioUrl: null });
  };`;
content = content.replace(convRemoveTarget, convRemoveReplace);

// 3. SentenceAudio logic
const sentUseEffectTarget = `  useEffect(() => {
    if (dialogue.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversationId}_\${dialogue.id}\`).then((blob) => {
        if (blob) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [conversationId, dialogue.id, dialogue.hasAudio]);`;

const sentUseEffectReplace = `  useEffect(() => {
    let active = true;
    if (dialogue.audioUrl) {
      setAudioUrl(dialogue.audioUrl);
    } else if (dialogue.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversationId}_\${dialogue.id}\`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }
    return () => {
      active = false;
    };
  }, [conversationId, dialogue.id, dialogue.hasAudio, dialogue.audioUrl]);`;
content = content.replace(sentUseEffectTarget, sentUseEffectReplace);


const sentUploadTarget = `  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      await localforage.setItem(\`audio_\${conversationId}_\${dialogue.id}\`, file);
      setAudioUrl(URL.createObjectURL(file));
      onUpdateDialogue(dialogue.id, { hasAudio: true });
    }
    if (e.target) {
        e.target.value = '';
    }
  };`;

const sentUploadReplace = `  const [isUploading, setIsUploading] = useState(false);
  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setIsUploading(true);
      try {
        if (auth.currentUser) {
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
        }
      } catch (err) {
        console.error("Upload error", err);
      }
      setIsUploading(false);
    }
    if (e.target) {
        e.target.value = '';
    }
  };`;
content = content.replace(sentUploadTarget, sentUploadReplace);

const sentRemoveTarget = `  const handleRemoveAudio = async () => {
    await localforage.removeItem(\`audio_\${conversationId}_\${dialogue.id}\`);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdateDialogue(dialogue.id, { hasAudio: false }); 
  };`;

const sentRemoveReplace = `  const handleRemoveAudio = async () => {
    if (auth.currentUser && dialogue.audioUrl) {
      try {
        const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversationId}/audio_\${dialogue.id}.mp3\`);
        await deleteObject(storageRef);
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(\`audio_\${conversationId}_\${dialogue.id}\`);
    }
    if (audioUrl && !audioUrl.startsWith('http')) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdateDialogue(dialogue.id, { hasAudio: false, audioUrl: null }); 
  };`;
content = content.replace(sentRemoveTarget, sentRemoveReplace);

// replace text in the button for upload
const sentButtonTarget = `Thêm MP3`;
const sentButtonReplace = `{isUploading ? 'Đang tải...' : 'Thêm MP3'}`;
content = content.replace(sentButtonTarget, sentButtonReplace);


fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched storage");
