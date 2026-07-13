const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `initialEditId={editCardReq?.id}`,
  `editCardReq={editCardReq}`
);

fs.writeFileSync('src/App.tsx', content);
