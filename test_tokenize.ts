import { tokenizeExampleText } from './src/utils/highlight';
const targetCard = {
  id: '1',
  kanji: '確認する',
  reading: 'かくにんする',
  forms: []
};
const example = '一緒に確認しましょう。';
const result = tokenizeExampleText(example, '確認', [targetCard]);
console.log(JSON.stringify(result, null, 2));
