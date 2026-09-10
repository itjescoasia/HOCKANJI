const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

code = code.replace(
  /join\("\\import \{ playTTS \} from '\.\.\/utils\/playTTS';\\nn"\);/,
  'join("\\n");'
);
code = code.replace(
  'join("\\import { playTTS } from \'../utils/playTTS\';\nn");',
  'join("\\n");'
);

code = `import { playTTS } from '../utils/playTTS';\n` + code;

fs.writeFileSync('src/components/ConversationView.tsx', code);
