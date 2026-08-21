const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

const targetStr = `      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Chưa đăng nhập");
        const filename = \`users/\${uid}/audio/\${Date.now()}_\${file.name}\`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        onAudioChange(url);
      } catch (err) {
        console.warn("Firebase Storage failed, falling back to Base64", err);
        // Fallback to Base64 data URL if storage is not provisioned or blocked
        if (file.size > 800 * 1024) {
           alert('File quá lớn (giới hạn 800KB cho chế độ dự phòng). Vui lòng chọn file nhỏ hơn.');
           return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
           onAudioChange(reader.result as string);
        };
        reader.onerror = () => {
           alert('Lỗi đọc file âm thanh.');
        };
        reader.readAsDataURL(file);
      }`;

const replacementStr = `      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Chưa đăng nhập");
        const filename = \`users/\${uid}/audio/\${Date.now()}_\${file.name}\`;
        const storageRef = ref(storage, filename);
        
        // Thêm timeout 5 giây để tránh treo Firebase
        await Promise.race([
          uploadBytes(storageRef, file),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout khi upload Cloud")), 5000))
        ]);
        
        const url = await getDownloadURL(storageRef);
        onAudioChange(url);
      } catch (err) {
        console.warn("Firebase Storage failed, falling back to Base64", err);
        // Fallback to Base64 data URL if storage is not provisioned or blocked
        if (file.size > 1500 * 1024) {
           alert('Tải lên Cloud bị lỗi và file quá lớn (giới hạn 1.5MB cho chế độ dự phòng). Vui lòng chọn file ngắn hơn.');
           return;
        }
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
             onAudioChange(reader.result);
             resolve(null);
          };
          reader.onerror = () => {
             alert('Lỗi đọc file âm thanh nội bộ.');
             reject(new Error("Lỗi đọc file"));
          };
          reader.readAsDataURL(file);
        });
      }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AudioUpload.tsx', code);
