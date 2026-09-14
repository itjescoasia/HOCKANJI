const fs = require('fs');

const files = [
  'src/components/IntensiveStudy.tsx',
  'src/components/SentenceReview.tsx',
  'src/components/AudioUpload.tsx',
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/components/AudioUpload.tsx') {
    code = `import { playAudioUrl } from '../utils/playTTS';\n` + code;
  }
  
  // Replace:
  // const audio = new Audio(url);
  // audio.play().catch(console.error);
  // With:
  // playAudioUrl(url);
  code = code.replace(/const audio = new Audio\(([^)]+)\);\s+audio\.play\(\)\.catch\([^)]+\);/g, 'playAudioUrl($1);');
  
  fs.writeFileSync(file, code);
}
