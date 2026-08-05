const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  'export interface DialogueSentence {',
  'export interface DialogueSentence {\n  hasAudio?: boolean;\n  audioUrl?: string | null;'
);

fs.writeFileSync('src/types.ts', content);
console.log('Patched types.ts');
