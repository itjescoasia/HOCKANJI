const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

// Replace playAudioUrl
const playAudioUrlOld = `export const playAudioUrl = (url: string) => {
  if (currentActiveAudio) {
    currentActiveAudio.pause();
    currentActiveAudio.currentTime = 0;
  }
  const audio = new Audio(url);
  currentActiveAudio = audio;
  audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Audio playback error:", e);
        }
      });
};`;

const playAudioUrlNew = `import { getDoc } from 'firebase/firestore';\n\nexport const playAudioUrl = async (url: string) => {
  if (!url) return;
  
  if (currentActiveAudio) {
    currentActiveAudio.pause();
    currentActiveAudio.currentTime = 0;
  }
  
  let finalUrl = url;
  if (url.startsWith('firestore:') && auth.currentUser) {
     try {
       const audioId = url.split(':')[1];
       const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
       if (docSnap.exists()) {
          finalUrl = docSnap.data().data;
       } else {
          console.warn("Firestore audio not found");
          return;
       }
     } catch(err) {
       console.error("Error fetching audio from firestore", err);
       return;
     }
  }

  const audio = new Audio(finalUrl);
  currentActiveAudio = audio;
  audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Audio playback error:", e);
        }
      });
};`;

code = code.replace(/import \{ doc, deleteDoc, setDoc \} from 'firebase\/firestore';/, "import { doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';");

code = code.replace(playAudioUrlOld, playAudioUrlNew.replace("import { getDoc } from 'firebase/firestore';\n\n", ""));

fs.writeFileSync('src/utils/playTTS.ts', code);
