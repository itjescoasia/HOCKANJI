const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

if (!code.includes('export const playAudioUrl =')) {
  code += `\nexport const playAudioUrl = (url: string) => {
  if (currentActiveAudio) {
    currentActiveAudio.pause();
    currentActiveAudio.currentTime = 0;
  }
  const audio = new Audio(url);
  currentActiveAudio = audio;
  audio.play().catch(console.error);
};\n`;
  fs.writeFileSync('src/utils/playTTS.ts', code);
}
