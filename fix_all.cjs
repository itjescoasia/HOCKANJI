const fs = require('fs');
const files = [
  'src/components/VocabList.tsx',
  'src/components/SentenceReview.tsx',
  'src/components/ReviewSession.tsx',
  'src/components/Dashboard.tsx',
  'src/components/ShortStudySession.tsx',
  'src/components/IntensiveStudy.tsx',
  'src/utils/highlight.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove the badly injected import
  code = code.replace(/\\import \{ playTTS \} from '\.\.\/utils\/playTTS';\n/g, '\\n');
  code = code.replace(/\\import \{ playTTS \} from '\.\.\/utils\/playTTS';\r?\n/g, '\\n');

  if (!code.startsWith('import { playTTS }')) {
    code = `import { playTTS } from '../utils/playTTS';\n` + code;
  }
  
  fs.writeFileSync(file, code);
}
