const example = "日本語をベトナム語に翻訳します。";
const card = {
  kanji: "翻訳する",
  reading: "ほんやくする",
  forms: [
    { value: "翻訳します" }
  ],
  interval: 1,
  repetition: 1,
};
const mainDeck = [card];

const uniqueWords = new Map();
mainDeck?.forEach(card => {
  const wordStr = card.kanji || card.reading;
  if (!wordStr || wordStr.length === 0) return;
      
  let isMatch = example.includes(wordStr);
      
  if (!isMatch && card.kanji) {
    const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
    if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem) && example.includes(stem)) {
      isMatch = true;
    }
  }
  if (!isMatch && card.forms) {
    for (const form of card.forms) {
      if (form.value && example.includes(form.value)) {
        isMatch = true;
        break;
      }
    }
  }
  if (isMatch) {
    if (!uniqueWords.has(wordStr)) {
      uniqueWords.set(wordStr, card);
    } else {
      const existing = uniqueWords.get(wordStr);
      const eScore = (existing.interval || 0) + (existing.repetition || 0);
      const cScore = (card.interval || 0) + (card.repetition || 0);
      if (cScore > eScore) {
        uniqueWords.set(wordStr, card);
      }
    }
  }
});
const deckWordsInExample = Array.from(uniqueWords.values());
const allMatchCandidates = [];
deckWordsInExample.forEach(card => {
  if (card.kanji) allMatchCandidates.push({ matchStr: card.kanji, card });
  if (card.reading && card.reading !== card.kanji) allMatchCandidates.push({ matchStr: card.reading, card });
  if (card.kanji) {
    const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
    if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem)) {
      allMatchCandidates.push({ matchStr: stem, card, isStem: true });
    }
  }
  if (card.forms) {
    card.forms.forEach(f => {
      if (f.value) {
        allMatchCandidates.push({ matchStr: f.value, card });
      }
    });
  }
});

const uniqueCandidates = Array.from(new Map(allMatchCandidates.map(c => [c.matchStr, c])).values());
uniqueCandidates.sort((a, b) => b.matchStr.length - a.matchStr.length);

let tokens = [
  { text: example, status: 'neutral' }
];

uniqueCandidates.forEach(({ matchStr, card, isStem }) => {
  let status = 'good';
  const newTokens = [];
  tokens.forEach(token => {
    if (token.status !== 'neutral') {
      newTokens.push(token);
      return;
    }
    
    let currentText = token.text;
    let searchIndex = 0;
    
    while (currentText.length > 0) {
      const idx = currentText.indexOf(matchStr, searchIndex);
      if (idx === -1) {
        newTokens.push({ text: currentText, status: 'neutral' });
        break;
      }
      
      if (isStem) {
        const nextChar = currentText[idx + matchStr.length];
        if (nextChar && /[\u4e00-\u9faf々]/.test(nextChar)) {
          searchIndex = idx + 1;
          continue;
        }
      }
      
      if (idx > 0) {
        newTokens.push({ text: currentText.substring(0, idx), status: 'neutral' });
      }
      newTokens.push({ text: matchStr, status, card });
      
      currentText = currentText.substring(idx + matchStr.length);
      searchIndex = 0;
    }
  });
  tokens = newTokens;
});

console.log(JSON.stringify(tokens, null, 2));
