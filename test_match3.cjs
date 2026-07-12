function findMatch(matchStr, text, type) {
  let lowerText = text.toLowerCase();
  if (!lowerText.includes(matchStr.toLowerCase())) {
    let found = false;
    for (let i = matchStr.length - 1; i >= Math.max(1, Math.floor(matchStr.length / 2)); i--) {
      const prefix = matchStr.substring(0, i);
      if (lowerText.includes(prefix.toLowerCase())) {
        if (type === 'hiragana') {
            const regex = new RegExp(`(${prefix}[ぁ-ん]*)`, 'i');
            const match = text.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        } else if (type === 'romaji') {
            const regex = new RegExp(`(?:^|[^a-z])(${prefix}[a-z]*)`, 'i');
            const match = text.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        }
      }
    }
    if (!found) return null;
  }
  return matchStr;
}
console.log(findMatch('たべる', 'わたし は りんご を たべます。', 'hiragana'));
console.log(findMatch('taberu', 'watashi wa ringo o tabemasu.', 'romaji'));
