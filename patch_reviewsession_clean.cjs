const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

code = code.replace(
  /const getJapaneseVoice = \(\) => \{\n.*?return voices.*?\}\s*\|\| voices.*?\n.*?\|\| voices.*?\n\s*\};\n/s,
  ""
);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
