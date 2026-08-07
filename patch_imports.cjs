const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace("import { auth, storage } from '../lib/firebase';", "import { auth, storage, db } from '../lib/firebase';");

if (!content.includes('firebase/firestore')) {
    content = content.replace("import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';",
    "import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';\nimport { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';");
}

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched imports");
