const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const searchStr = `  const handleTTS = async (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Check if we have an example with audio
    const currentExample = examples[currentIndex];
    if (currentExample && currentExample.audioUrl) {
       playAudioUrl(currentExample.audioUrl);
       return;
    }`;

const replaceStr = `  const handleTTS = async (text: string, e?: React.MouseEvent) => {
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
                playAudioUrl(urlToPlay);
                return;
            }
        } catch (err) {
            console.error("Failed to load/play audio", err);
        }
    }`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/SentenceReview.tsx', code);
  console.log("Patched SentenceReview successfully.");
} else {
  console.log("String not found in SentenceReview");
}
