const fs = require('fs');
let sr = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');
sr = sr.replace(/import \{ playTTS \} from '\.\.\/utils\/playTTS';/, "import { playTTS, playAudioUrl } from '../utils/playTTS';");

sr = sr.replace(/if \(currentAudio\) \{\s+currentAudio\.pause\(\);\s+currentAudio\.currentTime = 0;\s+\}\s+const audio = new Audio\(urlToPlay\);\s+currentAudio = audio;\s+audio\.play\(\)\.catch\(e => console\.error\("Error playing audio", e\)\);/g, "playAudioUrl(urlToPlay);");
sr = sr.replace(/if \(currentAudio\) \{\s+currentAudio\.pause\(\);\s+currentAudio\.currentTime = 0;\s+\}/g, "");
sr = sr.replace(/let currentAudio: HTMLAudioElement \| null = null;/g, "");
fs.writeFileSync('src/components/SentenceReview.tsx', sr);

let is = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
is = is.replace(/import \{ playTTS, generateAndUploadTTS \} from '\.\.\/utils\/playTTS';/, "import { playTTS, generateAndUploadTTS, playAudioUrl } from '../utils/playTTS';");

is = is.replace(/if \(currentAudio\) \{\s+currentAudio\.pause\(\);\s+currentAudio\.currentTime = 0;\s+\}\s+const audio = new Audio\(audioUrl\);\s+currentAudio = audio;\s+audio\.play\(\)\.catch\(console\.error\);/g, "playAudioUrl(audioUrl);");
is = is.replace(/if \(currentAudio\) \{\s+currentAudio\.pause\(\);\s+currentAudio\.currentTime = 0;\s+\}/g, "");
is = is.replace(/let currentAudio: HTMLAudioElement \| null = null;/g, "");
// Fix the one inside highlight.tsx if we missed it
fs.writeFileSync('src/components/IntensiveStudy.tsx', is);
