const text = "Tôi luyện tập võ thuật mỗi ngày.";
const meaning = "sự luyện tập, học tập";
const meanings = meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);

let bestMatch = { index: -1, length: 0, str: '' };
const lowerText = text.toLowerCase();
meanings.forEach(m => {
  const lowerM = m.toLowerCase();
  const idx = lowerText.indexOf(lowerM);
  if (idx !== -1 && m.length > bestMatch.length) {
    bestMatch = { index: idx, length: m.length, str: text.substring(idx, idx + m.length) };
  }
});

if (bestMatch.index === -1) {
  meanings.forEach(m => {
    let lowerM = m.toLowerCase();
    const prefixes = ['sự ', 'niềm ', 'cái ', 'con ', 'việc ', 'làm ', 'người '];
    prefixes.forEach(p => {
      if (lowerM.startsWith(p)) lowerM = lowerM.substring(p.length);
    });
    
    const words = lowerM.split(/[\\s\\.\\,\\!\\?]+/).filter(w => w.length > 0);
    
    for (let numWords = words.length; numWords >= 1; numWords--) {
      for (let start = 0; start <= words.length - numWords; start++) {
        const phrase = words.slice(start, start + numWords).join(' ');
        
        if (phrase.length < 3 && numWords === 1) continue; 
        
        const ignoreWords = [
          'một', 'những', 'các', 'để', 'và', 'của', 'là', 'có', 'không', 
          'sự', 'niềm', 'việc', 'làm', 'cái', 'trong', 'trên', 'dưới', 
          'với', 'cho', 'vào', 'ra', 'ở', 'tại', 'thì', 'mà', 'như', 
          'đã', 'đang', 'sẽ', 'bị', 'được', 'người', 'nhà', 'khi'
        ];
        if (numWords === 1 && ignoreWords.includes(phrase)) continue;

        const safePhrase = phrase.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
        const regex = new RegExp(`(?:^|[^\\\\p{L}\\\\p{N}])(${safePhrase})(?:[^\\\\p{L}\\\\p{N}]|$)`, 'giu');
        const matches = [...text.matchAll(regex)];
        for (const match of matches) {
          if (match.index !== undefined) {
            const matchedStr = match[1];
            const exactIdx = text.indexOf(matchedStr, match.index);
            if (exactIdx !== -1 && matchedStr.length > bestMatch.length) {
              bestMatch = { index: exactIdx, length: matchedStr.length, str: text.substring(exactIdx, exactIdx + matchedStr.length) };
            }
          }
        }
      }
    }
  });
}
console.log("Matched:", bestMatch);
