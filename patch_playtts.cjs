const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

code = code.replace("import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';", "import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';");

code += `\nexport const deleteCloudAudio = async (url?: string | null) => {
  if (!url || typeof url !== 'string' || !url.includes('firebasestorage.googleapis.com')) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    console.log("Deleted old audio from cloud:", url);
  } catch (err) {
    console.warn("Failed to delete cloud audio:", err);
  }
};
`;

fs.writeFileSync('src/utils/playTTS.ts', code);
