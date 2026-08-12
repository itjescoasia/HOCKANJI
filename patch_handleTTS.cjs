const fs = require('fs');

const path = 'src/components/SentenceReview.tsx';
let code = fs.readFileSync(path, 'utf8');

const importsToAdd = `import localforage from 'localforage';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';`;

if (!code.includes("import localforage")) {
    code = code.replace("import Markdown from 'react-markdown';", importsToAdd + "\nimport Markdown from 'react-markdown';");
}

const targetOldHandleTTS = `  const handleTTS = (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };`;

const targetNewHandleTTS = `  const handleTTS = async (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Check if we have an example with audio
    const currentExample = examples[currentIndex];
    if (currentExample && (currentExample.audioUrl || currentExample.hasAudio)) {
        try {
            let urlToPlay = null;
            if (currentExample.audioUrl) {
                if (currentExample.audioUrl.startsWith('firestore:') && auth.currentUser) {
                    const audioId = currentExample.audioUrl.split(':')[1];
                    const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
                    if (docSnap.exists()) {
                        urlToPlay = docSnap.data().data;
                    }
                } else {
                    urlToPlay = currentExample.audioUrl;
                }
            } else if (currentExample.hasAudio) {
                const blob = await localforage.getItem<Blob>(\`audio_intensive_\${currentExample.wordId}_\${currentExample.id}\`);
                if (blob) {
                    urlToPlay = URL.createObjectURL(blob);
                }
            }
            
            if (urlToPlay) {
                const audio = new Audio(urlToPlay);
                audio.play().catch(e => console.error("Error playing audio", e));
                return;
            }
        } catch (err) {
            console.error("Failed to load/play audio", err);
        }
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };`;

if (code.includes(targetOldHandleTTS)) {
    code = code.replace(targetOldHandleTTS, targetNewHandleTTS);
    fs.writeFileSync(path, code);
    console.log("Patched successfully.");
} else {
    console.log("Could not find handleTTS function to patch.");
}
