const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

const t1 = `    if (res.ok) {
      const data = await res.json();
      if (data.audioContent) {`;
      
const r1 = `    if (res.ok) {
      const data = await res.json();
      if (data.audioContent) {
`;

code = code.replace(
  `    if (res.ok) {
      const data = await res.json();`,
  `    if (!res.ok) {
      const err = await res.text();
      console.error("API error", res.status, err);
      return null;
    }
    if (res.ok) {
      const data = await res.json();`
);
fs.writeFileSync('src/utils/playTTS.ts', code);
