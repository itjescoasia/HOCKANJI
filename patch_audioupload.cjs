const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

// Add setDoc and doc to imports
code = code.replace(
  /import \{ ref, uploadBytes, getDownloadURL \} from 'firebase\/storage';/,
  "import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';\nimport { doc, setDoc } from 'firebase/firestore';\nimport { db } from '../lib/firebase';"
);

// Replace the fallback logic
const searchStr = `        // Fallback to Base64 data URL if storage is not provisioned or blocked
        if (file.size > 300 * 1024) { 
           alert('File mp3 quá lớn (Vượt quá 300KB). Do tính năng Cloud Storage chưa được cấp quyền, hệ thống chỉ lưu tạm vào Database nên dung lượng bị giới hạn để không gây sập ứng dụng. Vui lòng cắt mp3 ngắn hơn (khoảng 3-5 giây) hoặc dùng file chất lượng thấp.');
           return;
        }

        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => { 
             onAudioChange(reader.result as string); 
             resolve(null);
          };
          reader.onerror = () => { 
             alert('Lỗi đọc file âm thanh nội bộ.');
             reject(new Error("Lỗi đọc file"));
          };
          reader.readAsDataURL(file);
        });`;

const replaceStr = `        // Fallback to saving Base64 string in Firestore 'audio' collection
        if (file.size > 800 * 1024) { 
           alert('File mp3 quá lớn (Vượt quá 800KB). Vui lòng cắt mp3 ngắn hơn hoặc dùng file chất lượng thấp.');
           return;
        }

        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
             try {
                const uid = auth.currentUser?.uid;
                if (uid) {
                   const audioId = Date.now() + "_" + Math.random().toString(36).substring(7);
                   const audioDocRef = doc(db, 'users', uid, 'audio', audioId);
                   await setDoc(audioDocRef, { data: reader.result as string, createdAt: Date.now() });
                   onAudioChange('firestore:' + audioId);
                } else {
                   onAudioChange(reader.result as string);
                }
             } catch(e) {
                console.error("Firestore fallback save failed:", e);
                alert("Lỗi khi lưu audio. Vui lòng thử lại.");
             }
             resolve(null);
          };
          reader.onerror = () => { 
             alert('Lỗi đọc file âm thanh nội bộ.');
             reject(new Error("Lỗi đọc file"));
          };
          reader.readAsDataURL(file);
        });`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
} else {
  console.log("Fallback logic not found in AudioUpload.tsx");
}

fs.writeFileSync('src/components/AudioUpload.tsx', code);
