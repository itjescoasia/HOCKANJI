const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

const targetStr = `    try {
      setIsUploading(true);
      const filename = \`audio/\${Date.now()}_\${file.name}\`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onAudioChange(url);
    } catch (err) {
      console.error("Upload error", err);
      alert('Lỗi tải file âm thanh lên.');
    } finally {`;

const replacementStr = `    try {
      setIsUploading(true);
      
      // Attempt Firebase Storage first
      try {
        const filename = \`audio/\${Date.now()}_\${file.name}\`;
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
      }
    } finally {`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AudioUpload.tsx', code);
