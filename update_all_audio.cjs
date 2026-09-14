const fs = require('fs');

function updateFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  let changed = false;

  if (code.includes('import { playTTS')) {
    if (!code.includes('playAudioUrl')) {
      code = code.replace(/import \{([^}]+playTTS[^}]+)\} from '[^']+playTTS';/, (match, group) => {
        return match.replace(group, group + ', playAudioUrl');
      });
      changed = true;
    }
  } else if (code.includes('new Audio')) {
    code = `import { playAudioUrl } from '../utils/playTTS';\n` + code;
    changed = true;
  }

  // Common pattern 1
  const p1 = /const audio = new Audio\(([^)]+)\);\s*audio\.play\(\)\.catch\(console\.error\);/g;
  if (p1.test(code)) {
    code = code.replace(p1, 'playAudioUrl($1);');
    changed = true;
  }
  
  // Common pattern 2
  const p2 = /const audio = new Audio\(([^)]+)\);\s*audio\.play\(\)\.catch\([^\)]+\);/g;
  if (p2.test(code)) {
    code = code.replace(p2, 'playAudioUrl($1);');
    changed = true;
  }

  // Common pattern 3
  const p3 = /new Audio\(([^)]+)\)\.play\(\)\.catch\([^\)]+\);/g;
  if (p3.test(code)) {
    code = code.replace(p3, 'playAudioUrl($1);');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(path, code);
  }
}

const files = [
  'src/components/ReviewSession.tsx',
  'src/components/ShortStudySession.tsx',
  'src/components/AudioUpload.tsx',
  'src/components/VocabList.tsx',
  'src/components/ConversationView.tsx',
  'src/components/Dashboard.tsx',
  'src/utils/highlight.tsx',
];

for (const file of files) {
  updateFile(file);
}

