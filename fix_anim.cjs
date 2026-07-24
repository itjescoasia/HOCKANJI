const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');
content = content.replace(
  /initial=\{\{ opacity: 0, scale: 0\.2, rotate: -180, y: -20 \}\}/,
  'initial={{ opacity: 0, scale: 0.5, rotateY: 360, y: -20 }}'
);
content = content.replace(
  /animate=\{\{ opacity: 1, scale: 1, rotate: 0, y: 0 \}\}/,
  'animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}'
);
content = content.replace(
  /exit=\{\{ opacity: 0, scale: 0\.2, rotate: 180, y: -20 \}\}/,
  'exit={{ opacity: 0, scale: 0.5, rotateY: -360, y: -20 }}'
);
fs.writeFileSync('src/utils/highlight.tsx', content);
