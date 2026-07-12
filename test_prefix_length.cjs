function findPrefix(matchStr, cleanText, type) {
  let lowerText = cleanText.toLowerCase();
  let minPrefixLength = type === 'hiragana' ? 2 : 3;

  for (let i = matchStr.length - 1; i >= Math.max(minPrefixLength, Math.floor(matchStr.length / 2)); i--) {
    const prefix = matchStr.substring(0, i);
    console.log(`Testing prefix [${prefix}] against [${lowerText}]`);
    if (lowerText.includes(prefix.toLowerCase())) {
        return prefix;
    }
  }
  return null;
}

console.log("kuru (hiragana):", findPrefix('くる', 'きてください', 'hiragana'));
console.log("kuru (romaji):", findPrefix('kuru', 'kite kudasai', 'romaji'));
console.log("taberu (hiragana):", findPrefix('たべる', 'たべます', 'hiragana'));
console.log("taberu (romaji):", findPrefix('taberu', 'tabemasu', 'romaji'));
console.log("yomu (hiragana):", findPrefix('よむ', 'よんで', 'hiragana'));
console.log("yomu (romaji):", findPrefix('yomu', 'yonde', 'romaji'));
