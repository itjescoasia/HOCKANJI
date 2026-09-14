const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

code = code.split('data:audio/mp3;base64,${data.audioContent}').join('data:audio/wav;base64,${data.audioContent}');

fs.writeFileSync('src/utils/playTTS.ts', code);
