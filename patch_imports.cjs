const fs = require('fs');

let code1 = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
if (!code1.includes('import { Music }')) {
  code1 = code1.replace('import { playTTS } from \'../utils/playTTS\';', 'import { playTTS, generateAndUploadTTS } from \'../utils/playTTS\';');
  code1 = code1.replace('Copy,', 'Copy, Music,');
  fs.writeFileSync('src/components/IntensiveStudy.tsx', code1);
}

let code2 = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');
if (!code2.includes('import { Music }')) {
  code2 = code2.replace('import { playTTS } from \'../utils/playTTS\';', 'import { playTTS, generateAndUploadTTS } from \'../utils/playTTS\';');
  code2 = code2.replace('ArrowRightLeft } from "lucide-react";', 'ArrowRightLeft, Music } from "lucide-react";');
  fs.writeFileSync('src/components/ConversationView.tsx', code2);
}

