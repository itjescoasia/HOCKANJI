const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  '  viToJaNextReviewDate?: number;',
  '  viToJaNextReviewDate?: number;\n  audioUrl?: string | null;\n  hasAudio?: boolean;'
);

fs.writeFileSync('src/types.ts', content);
console.log('Patched types.ts');
