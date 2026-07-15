const suffixes = [
  "しまいました", "しましょう", "しません", "しました", "します", "しまう", "しまった", "しまって",
  "ています", "ていました", "ていません", "ている", "ていた", "ていて",
  "てあります", "てありました", "てありません", "てある", "てあった", "てあって",
  "ておきます", "ておきました", "ておきません", "ておく", "ておいた", "ておいて",
  "てみます", "てみました", "てみません", "てみる", "てみた", "てみて",
  "ていきます", "ていきました", "ていきません", "ていく", "ていった", "ていって",
  "てきます", "てきました", "てきません", "てくる", "てきた", "てきて",
  "られます", "られました", "られません", "られる", "られた", "られて",
  "させられます", "させられました", "させられません", "させられる", "させられた", "させられて",
  "させます", "させました", "させません", "させる", "させた", "させて",
  "やすいです", "やすい", "やすかった", "やすく",
  "にくいです", "にくい", "にくかった", "にくく",
  "すぎます", "すぎました", "すぎません", "すぎる", "すぎた", "すぎて",
  "なさい", "なさいました", "なさいません", "なさる", "なさった", "なさって",
  "たいです", "たい", "たかった", "たく",
  "たがります", "たがりました", "たがりません", "たがる", "たがった", "たがって",
  "かもしれない", "かもしれません",
  "でしょう", "だろう", "でしょうか",
  "らしいです", "らしい", "らしかった", "らしく",
  "そうです", "そう", "そうだった", "そうに", "そうな",
  "みたいです", "みたい", "みたいだった", "みたいに", "みたいな",
  "ます", "ました", "ません", "ましょう",
  "です", "でした", "ではない", "じゃない", "だ", "だった",
  "から", "ので", "のに", "けれども", "けれど", "けど", "が", "と", "ば", "たら", "なら"
];

// Sort by length descending to match longest first
suffixes.sort((a, b) => b.length - a.length);

function trimAuxiliary(text) {
  let original = text;
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of suffixes) {
      if (text.endsWith(suffix) && text.length > suffix.length) {
        text = text.substring(0, text.length - suffix.length);
        changed = true;
        break; // Start over with the new text
      }
    }
  }
  return text;
}

console.log(trimAuxiliary("迷ってしまいました")); // Expect "迷って"
console.log(trimAuxiliary("食べさせられませんでしたから")); // Expect "食べ" or "食べて"
console.log(trimAuxiliary("分かりにくいです")); // Expect "分かり"
console.log(trimAuxiliary("飲みたがっていました")); // Expect "飲み"
console.log(trimAuxiliary("迷います")); // Expect "迷い"
console.log(trimAuxiliary("走っています")); // Expect "走っ" (Wait, 走って + います -> 走っ ? Ah, ています -> 走っ. But we want 走って!)
