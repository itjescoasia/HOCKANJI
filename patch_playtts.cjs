const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

// Add setDoc to import
code = code.replace(
  /import \{ doc, deleteDoc \} from 'firebase\/firestore';/,
  "import { doc, deleteDoc, setDoc } from 'firebase/firestore';"
);

// Replace fallback
const searchStr = `        } catch (uploadError) {
          console.warn("Bulk upload failed:", uploadError);
        }
        
        // Return base64Url as fallback so the UI still works even if cloud save fails
        return base64Url;`;

const replaceStr = `        } catch (uploadError) {
          console.warn("Bulk upload failed:", uploadError);
          const uid = auth.currentUser?.uid;
          if (uid) {
             try {
                const audioId = Date.now() + "_" + Math.random().toString(36).substring(7);
                const audioDocRef = doc(db, 'users', uid, 'audio', audioId);
                await setDoc(audioDocRef, { data: base64Url, createdAt: Date.now() });
                console.log("Saved audio to firestore fallback collection.");
                return 'firestore:' + audioId;
             } catch (fsErr) {
                console.warn("Firestore fallback failed:", fsErr);
             }
          }
        }
        
        // If all fails, just return null so we don't blow up the document limit
        return null;`;

if (code.includes(searchStr)) {
   code = code.replace(searchStr, replaceStr);
} else {
   console.log("Could not find the fallback block in playTTS.ts");
}

fs.writeFileSync('src/utils/playTTS.ts', code);
