const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');
code = code.replace(/const audio = new Audio\(audioUrl\);\s+audio\.play\(\);/, 'playAudioUrl(audioUrl);');
fs.writeFileSync('src/components/AudioUpload.tsx', code);
