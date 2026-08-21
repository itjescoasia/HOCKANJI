const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/translation: string;\n  audioUrl\?: string \| null;\n  hasAudio\?: boolean;/g, 'translation: string;');
code = code.replace(/translation: string;/g, 'translation: string;\n  audioUrl?: string | null;\n  hasAudio?: boolean;');
fs.writeFileSync('src/types.ts', code);
