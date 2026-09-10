const fs = require('fs');

const code = `import localforage from 'localforage';

const ttsCache = localforage.createInstance({
  name: 'tts-cache',
  storeName: 'audio_cache'
});

export const playTTS = async (text: string) => {
  if (!text) return;
  try {
    // 1. Kiểm tra cache xem đã từng tạo audio cho text này chưa
    const cachedAudio = await ttsCache.getItem<string>(text);
    if (cachedAudio) {
      console.log("Playing from TTS Cache:", text);
      const audio = new Audio(\`data:audio/mp3;base64,\${cachedAudio}\`);
      audio.play().catch(console.error);
      return;
    }

    // 2. Nếu chưa có, gọi API Inworld để tạo mới
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.audioContent) {
        // 3. Lưu vào bộ nhớ cục bộ để dùng cho lần sau
        await ttsCache.setItem(text, data.audioContent);
        console.log("Saved to TTS Cache:", text);
        
        const audio = new Audio(\`data:audio/mp3;base64,\${data.audioContent}\`);
        audio.play().catch(console.error);
        
        // Tùy chọn: Bắn sự kiện ra ngoài phòng trường hợp app muốn update dữ liệu card
        window.dispatchEvent(new CustomEvent('tts-generated', { 
          detail: { text, audioUrl: \`data:audio/mp3;base64,\${data.audioContent}\` } 
        }));
        
        return; // Success
      }
    } else {
       console.error("TTS API returned", res.status);
    }
    
    // Fallback if API fails or isn't configured
    console.warn("Inworld TTS failed or missing, falling back to window.speechSynthesis");
    fallbackTTS(text);
  } catch (error) {
    console.error("Error playing TTS:", error);
    fallbackTTS(text);
  }
};

const fallbackTTS = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  // Attempt to use a Japanese voice if available
  const voices = window.speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang === 'ja-JP');
  if (jpVoice) utterance.voice = jpVoice;
  window.speechSynthesis.speak(utterance);
}
`;

fs.writeFileSync('src/utils/playTTS.ts', code);
