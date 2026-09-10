const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

code = code.replaceAll(
  'const filename = `users/${uid}/audio/${Date.now()}_TTS.mp3`;',
  'const filename = `users/${uid}/audio/${Date.now()}_${Math.random().toString(36).substring(7)}_TTS.mp3`;'
);

fs.writeFileSync('src/utils/playTTS.ts', code);
