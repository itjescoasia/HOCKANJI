const cleanText = 'きてください';
let matchStr = 'くる';
let lowerText = cleanText.toLowerCase();

if (!lowerText.includes(matchStr.toLowerCase())) {
  let found = false;
  for (let i = matchStr.length - 1; i >= Math.max(1, Math.floor(matchStr.length / 2)); i--) {
    const prefix = matchStr.substring(0, i);
    console.log("Testing prefix:", prefix);
    if (lowerText.includes(prefix.toLowerCase())) {
      const regex = new RegExp(`(${prefix}[ぁ-ん]*)`, 'i');
      const match = cleanText.match(regex);
      if (match) {
          matchStr = match[1];
          found = true;
          break;
      }
    }
  }
}
console.log("Final matchStr:", matchStr);
