const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

code = code.replace(
  'onChange={handleFileChange}',
  'ref={fileInputRef}\n            onChange={handleFileChange}'
);

fs.writeFileSync('src/components/AudioUpload.tsx', code);
