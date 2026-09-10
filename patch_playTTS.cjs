const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

// In playTTS
code = code.replace(
  `        // Fallback: Dispatch the base64 if cloud upload failed or user not logged in
        // The DB might reject it if it's too large, but we try.
        window.dispatchEvent(new CustomEvent('tts-generated', { 
          detail: { text, audioUrl: base64Url } 
        }));`,
  `        // Bỏ lưu base64 vào DB để tránh lỗi vượt quá 1MB`
);

// In generateAndUploadTTS
code = code.replace(
  `        window.dispatchEvent(new CustomEvent('tts-generated', { 
          detail: { text, audioUrl: base64Url } 
        }));
        return base64Url;`,
  `        // Bỏ lưu base64 vào DB để tránh lỗi vượt quá 1MB
        return null;`
);

// Tăng timeout lên 15 giây cho chắc ăn
code = code.replaceAll('5000', '15000');

fs.writeFileSync('src/utils/playTTS.ts', code);
