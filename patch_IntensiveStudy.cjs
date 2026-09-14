const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

if (!code.includes('let currentAudio: HTMLAudioElement | null = null;')) {
  const match = `const IntensiveStudy = ({`;
  code = code.replace(match, `let currentAudio: HTMLAudioElement | null = null;\n\nconst IntensiveStudy = ({`);
}

const playMatch = `            const audio = new Audio(urlToPlay);
            audio.play().catch(e => console.error("Error playing audio", e));`;
const playReplacement = `            if (currentAudio) {
              currentAudio.pause();
              currentAudio.currentTime = 0;
            }
            const audio = new Audio(urlToPlay);
            currentAudio = audio;
            audio.play().catch(e => console.error("Error playing audio", e));`;
code = code.replace(playMatch, playReplacement);

const fallbackMatch = `    }

    playTTS(text);`;
const fallbackReplacement = `    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    playTTS(text);`;
code = code.replace(fallbackMatch, fallbackReplacement);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
