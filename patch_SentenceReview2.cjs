const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const fallbackMatch = `    }

    playTTS(text);`;
const fallbackReplacement = `    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    playTTS(text);`;

code = code.replace(fallbackMatch, fallbackReplacement);
fs.writeFileSync('src/components/SentenceReview.tsx', code);
