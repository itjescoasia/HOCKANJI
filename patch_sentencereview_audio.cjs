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
    }
    
    playTTS(text);
  };`;

const replaceStr = `  const handleTTS = async (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Check if we have an example with audio
    const currentExample = examples[currentIndex];
    if (currentExample && currentExample.audioUrl) {
       playAudioUrl(currentExample.audioUrl);
       return;
    }
    
    // Check if it's the old example format
    if (currentExample && currentExample.hasAudio) {
       try {
           if (currentExample.wordId && currentExample.id) {
               const blob = await localforage.getItem<Blob>(\`audio_intensive_\${currentExample.wordId}_\${currentExample.id}\`);
               if (blob) {
                   const url = URL.createObjectURL(blob);
                   playAudioUrl(url);
                   return;
               }
           }
       } catch (err) {
           console.error("Failed to play local audio", err);
       }
    }
    
    playTTS(text);
  };`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync('src/components/SentenceReview.tsx', code);
    console.log("Patched SentenceReview successfully.");
} else {
    console.log("Could not find the target string.");
}
