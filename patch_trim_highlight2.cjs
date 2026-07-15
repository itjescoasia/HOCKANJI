const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to replace the old trimAuxiliary block with the new one.
// Let's just find and replace the whole thing.

const startMarker = 'const suffixes = [';
const endMarker = 'return text;\n}\n';

const oldStart = content.indexOf(startMarker);
const oldEnd = content.indexOf(endMarker, oldStart);

if (oldStart !== -1 && oldEnd !== -1) {
    const newTrimAuxCode = `const suffixes = [
  "させられませんでした", "させられません", "させられました", "させられる", "させられた", "させられて", "させられない",
  "させませんでした", "させません", "させました", "させます", "させる", "させた", "させて", "させない",
  "られませんでした", "られません", "られました", "られます", "られる", "られた", "られて", "られない",
  "れませんでした", "れません", "れました", "れます", "れる", "れた", "れて", "れない",
  "ませんでした", "ません", "ました", "ます", "ましょう",
  "しまいました", "しましょう", "しません", "しました", "します", "しまう", "しまった", "しまって",
  "いました", "いません", "います", "いる", "いた", "いて", "いない",
  "ありました", "ありません", "あります", "ある", "あった", "あって",
  "おきました", "おきません", "おきます", "おく", "おいた", "おいて", "おかない",
  "みました", "みません", "みます", "みる", "みた", "みて", "みない",
  "いきました", "いきません", "いきます", "いく", "いった", "いって", "いかない",
  "きました", "きません", "きます", "くる", "きた", "きて", "こない",
  "やすいです", "やすい", "やすかった", "やすく",
  "にくいです", "にくい", "にくかった", "にくく",
  "すぎます", "すぎました", "すぎません", "すぎる", "すぎた", "すぎて",
  "なさい", "なさいました", "なさいません", "なさる", "なさった", "なさって",
  "たいです", "たい", "たかった", "たく", "たくない", "たくありません", "たくなかった", "たくありませんでした",
  "たがります", "たがりました", "たがりません", "たがる", "たがった", "たがって",
  "かもしれない", "かもしれません",
  "でしょう", "だろう", "でしょうか",
  "らしいです", "らしい", "らしかった", "らしく",
  "そうです", "そう", "そうだった", "そうに", "そうな",
  "みたいです", "みたい", "みたいだった", "みたいに", "みたいな",
  "ではありません", "じゃありません", "ではない", "じゃない",
  "です", "でした", "だ", "だった",
  "から", "ので", "のに", "けれども", "けれど", "けど", "が", "と", "ば", "たら", "なら"
].sort((a, b) => b.length - a.length);

export function trimAuxiliary(text: string) {
  let changed = true;
  let result = text;
  while (changed) {
    changed = false;
    for (const suffix of suffixes) {
      if (result.endsWith(suffix) && result.length > suffix.length) {
        result = result.substring(0, result.length - suffix.length);
        changed = true;
        break;
      }
    }
  }
  return result;
}`;

    content = content.substring(0, oldStart) + newTrimAuxCode + content.substring(oldEnd + endMarker.length);
    fs.writeFileSync(file, content);
    console.log('Updated trimAuxiliary!');
} else {
    console.error('Could not find existing trimAuxiliary code block');
}
