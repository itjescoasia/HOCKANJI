const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace("import localforage from 'localforage';\nimport { auth } from '../lib/firebase';", "import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';\nimport { storage, auth } from '../lib/firebase';");

const oldState = `  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
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
  }, [conversation.id, conversation.hasAudio]);

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      await localforage.setItem(\`audio_\${conversation.id}\`, file);
      setAudioUrl(URL.createObjectURL(file));
      onUpdate(conversation.id, { hasAudio: true });
    }
    if (e.target) {
        e.target.value = '';
    }
  };
  
  const handleRemoveAudio = async () => {
    await localforage.removeItem(\`audio_\${conversation.id}\`);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdate(conversation.id, { hasAudio: false });
  };`;

const newState = `  const [audioUrl, setAudioUrl] = useState<string | null>(conversation.audioUrl || null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAudioUrl(conversation.audioUrl || null);
  }, [conversation.audioUrl]);

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/') && auth.currentUser) {
      setIsUploadingAudio(true);
      try {
        const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversation.id}/audio.mp3\`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setAudioUrl(url);
        onUpdate(conversation.id, { audioUrl: url });
      } catch (err) {
        console.error("Upload audio failed:", err);
      } finally {
        setIsUploadingAudio(false);
      }
    }
    if (e.target) {
        e.target.value = '';
    }
  };
  
  const handleRemoveAudio = async () => {
    if (auth.currentUser) {
      try {
        const storageRef = ref(storage, \`users/\${auth.currentUser.uid}/conversations/\${conversation.id}/audio.mp3\`);
        await deleteObject(storageRef);
      } catch (err) {
        console.error("Delete audio failed:", err);
      }
    }
    setAudioUrl(null);
    onUpdate(conversation.id, { audioUrl: null });
  };`;

content = content.replace(oldState, newState);
fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched ConversationView.tsx to use Firebase Storage");
