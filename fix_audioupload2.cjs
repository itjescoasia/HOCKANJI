const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');
code = code.replace(/const audio = new Audio\(audioUrl\);\s+audio\.play\(\)\.catch\(\(\) => alert\("Không thể phát link âm thanh này. Link có thể bị hỏng hoặc bị chặn CORS."\)\);/, 'playAudioUrl(audioUrl);');
fs.writeFileSync('src/components/AudioUpload.tsx', code);
