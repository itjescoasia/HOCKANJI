import { tokenizeExampleText } from './src/utils/highlight.js';
console.log(tokenizeExampleText("日本語をベトナム語に翻訳します。", "", [
  { kanji: "翻訳する", reading: "ほんやくする", forms: [{id: "1", name: "polite", value: "翻訳します"}], interval: 1, repetition: 1 }
]));
