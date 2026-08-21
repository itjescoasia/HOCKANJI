const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

if (!code.includes("import { auth }")) {
  code = code.replace("import { storage }", "import { storage, auth }");
}

const targetStr = `        const filename = \`audio/\${Date.now()}_\${file.name}\`;`;
const replacementStr = `        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Chưa đăng nhập");
        const filename = \`users/\${uid}/audio/\${Date.now()}_\${file.name}\`;`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AudioUpload.tsx', code);
