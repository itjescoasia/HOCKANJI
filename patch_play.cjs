const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

code = code.replace(/audio\.play\(\)\.catch\(console\.error\);/g, `audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Audio playback error:", e);
        }
      });`);

fs.writeFileSync('src/utils/playTTS.ts', code);
