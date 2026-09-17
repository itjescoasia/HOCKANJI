const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

const searchStr = `    if (!res.ok) {
      const err = await res.text();
      console.error("API error", res.status, err);
      return null;
    }`;

const replaceStr = `    if (!res.ok) {
      const err = await res.text();
      console.error("API error", res.status, err);
      console.warn("Inworld TTS failed or missing, falling back to window.speechSynthesis");
      fallbackTTS(text);
      return null;
    }`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/utils/playTTS.ts', code);
  console.log("Patched playTTS successfully.");
} else {
  console.log("String not found in playTTS");
}
