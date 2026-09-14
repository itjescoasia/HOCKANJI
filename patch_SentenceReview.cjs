const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const ttsMatch = `  const handleTTS = async (text: string, e?: React.MouseEvent) => {`;
if (!code.includes('let currentAudio: HTMLAudioElement | null = null;')) {
  code = code.replace(ttsMatch, `let currentAudio: HTMLAudioElement | null = null;\n\n  const handleTTS = async (text: string, e?: React.MouseEvent) => {`);
}

const playMatch = `                const audio = new Audio(urlToPlay);
                audio.play().catch(e => console.error("Error playing audio", e));`;
const playReplacement = `                if (currentAudio) {
                  currentAudio.pause();
                  currentAudio.currentTime = 0;
                }
                const audio = new Audio(urlToPlay);
                currentAudio = audio;
                audio.play().catch(e => console.error("Error playing audio", e));`;

code = code.replace(playMatch, playReplacement);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
