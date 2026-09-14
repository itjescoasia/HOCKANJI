const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

if (!code.includes('let currentActiveAudio: HTMLAudioElement | null = null;')) {
  code = code.replace(`export const playTTS = async (text: string) => {`, `let currentActiveAudio: HTMLAudioElement | null = null;\n\nexport const playTTS = async (text: string) => {`);
}

const cachedAudioMatch = `      const audio = new Audio(\`data:audio/mp3;base64,\${cachedAudio}\`);
      audio.play().catch(console.error);`;
const cachedAudioReplacement = `      if (currentActiveAudio) {
        currentActiveAudio.pause();
        currentActiveAudio.currentTime = 0;
      }
      const audio = new Audio(\`data:audio/mp3;base64,\${cachedAudio}\`);
      currentActiveAudio = audio;
      audio.play().catch(console.error);`;
code = code.replace(cachedAudioMatch, cachedAudioReplacement);

const newAudioMatch = `        const base64Url = \`data:audio/mp3;base64,\${data.audioContent}\`;
        const audio = new Audio(base64Url);
        audio.play().catch(console.error);`;
const newAudioReplacement = `        const base64Url = \`data:audio/mp3;base64,\${data.audioContent}\`;
        if (currentActiveAudio) {
          currentActiveAudio.pause();
          currentActiveAudio.currentTime = 0;
        }
        const audio = new Audio(base64Url);
        currentActiveAudio = audio;
        audio.play().catch(console.error);`;
code = code.replace(newAudioMatch, newAudioReplacement);

fs.writeFileSync('src/utils/playTTS.ts', code);
