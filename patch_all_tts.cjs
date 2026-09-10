const fs = require('fs');

const filesToPatch = [
  'src/components/ConversationView.tsx',
  'src/components/VocabList.tsx',
  'src/components/SentenceReview.tsx',
  'src/components/ReviewSession.tsx',
  'src/components/Dashboard.tsx',
  'src/components/ShortStudySession.tsx',
  'src/components/IntensiveStudy.tsx',
  'src/utils/highlight.tsx'
];

for (const file of filesToPatch) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Add import if not exists
  if (!code.includes('import { playTTS }')) {
     const importStmt = `import { playTTS } from '../utils/playTTS';\n`;
     // try to insert after the last import, or at the top
     const lastImportIndex = code.lastIndexOf('import ');
     if (lastImportIndex !== -1) {
       const endOfLine = code.indexOf('\\n', lastImportIndex);
       code = code.substring(0, endOfLine + 1) + importStmt + code.substring(endOfLine + 1);
     } else {
       code = importStmt + code;
     }
  }

  // Replace standard block
  // We need to handle variations in indentation or variable names, but they are all very similar
  code = code.replace(
    /if \(![a-zA-Z0-9_]+ \|\| !\('speechSynthesis' in window\)\) return;\n\s*window\.speechSynthesis\.cancel\(\);\n\s*const utterance = new SpeechSynthesisUtterance\([a-zA-Z0-9_]+\);\n\s*utterance\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(utterance\);/g,
    (match) => {
       const varMatch = match.match(/SpeechSynthesisUtterance\(([a-zA-Z0-9_]+)\)/);
       if (varMatch) {
         return `playTTS(${varMatch[1]});`;
       }
       return match;
    }
  );
  
  code = code.replace(
    /if \(![a-zA-Z0-9_]+ \|\| !\('speechSynthesis' in window\)\) return;\n\s*const utterance = new SpeechSynthesisUtterance\([a-zA-Z0-9_]+\);\n\s*utterance\.lang = 'ja-JP';\n\s*window\.speechSynthesis\.speak\(utterance\);/g,
    (match) => {
       const varMatch = match.match(/SpeechSynthesisUtterance\(([a-zA-Z0-9_]+)\)/);
       if (varMatch) {
         return `playTTS(${varMatch[1]});`;
       }
       return match;
    }
  );
  
  fs.writeFileSync(file, code);
}
