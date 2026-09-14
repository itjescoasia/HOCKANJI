const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const playMatch = `    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
      return;
    }`;
const playReplacement = `    if (audioUrl) {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.play().catch(console.error);
      return;
    }`;

code = code.replaceAll(playMatch, playReplacement);

const fallbackMatch = `    }
    playTTS(text);`;
const fallbackReplacement = `    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    playTTS(text);`;
code = code.replaceAll(fallbackMatch, fallbackReplacement);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
