const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const particlesFunc = `
export function trimTrailingParticles(text: string) {
  const particles = [
    "から", "ので", "のに", "けれども", "けれど", "けど", "が", "と", "ば", "たら", "なら",
    "し", "ね", "よ", "わ", "ぞ", "ぜ", "か", "かしら", "さ", "くらい", "ぐらい", "だけ",
    "ばかり", "など", "まで", "でも", "とか", "や", "の", "に", "を", "へ", "で", "は", "も", "って"
  ].sort((a, b) => b.length - a.length);
  
  let changed = true;
  let result = text;
  while (changed) {
    changed = false;
    for (const p of particles) {
      if (result.endsWith(p) && result.length > p.length) {
        // Ensure we don't trim the entire string
        if (result === p) break;
        result = result.substring(0, result.length - p.length);
        changed = true;
        break;
      }
    }
  }
  return result;
}
`;

if (!file.includes('trimTrailingParticles')) {
  file = file.replace('export function trimAuxiliary(text: string) {', particlesFunc + '\nexport function trimAuxiliary(text: string) {');
}

const target = `        if (isStem) {
          actualMatchStr = currentText.substring(idx, idx + matchLen);
        }`;

const replacement = `        if (isStem) {
          actualMatchStr = currentText.substring(idx, idx + matchLen);
          let trimmed = trimTrailingParticles(actualMatchStr);
          if (trimmed && trimmed.length >= matchStr.length) {
            actualMatchStr = trimmed;
          }
        }`;

if (file.includes(target)) {
  file = file.replace(target, replacement);
  fs.writeFileSync('src/utils/highlight.tsx', file);
  console.log('Patched trimTrailingParticles');
} else {
  console.log('Could not find target');
}
