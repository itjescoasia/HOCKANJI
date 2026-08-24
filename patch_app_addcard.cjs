const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            onAdd={async (kanji, reading, meaning, sinoVietnamese, examples, wordType, kanjiExplanation, romaji, forms) => {
              await addCard(kanji, reading, meaning, sinoVietnamese || '', '', '', wordType || '', kanjiExplanation || '', romaji || '', examples || [], forms || []);
              alert('Vừa thêm từ vựng mới thành công');`;

const replacementStr = `            onAdd={async (kanji, reading, meaning, sinoVietnamese, examples, wordType, kanjiExplanation, romaji, forms, audioUrl, hasAudio) => {
              await addCard(kanji, reading, meaning, sinoVietnamese || '', '', '', wordType || '', kanjiExplanation || '', romaji || '', examples || [], forms || [], audioUrl, hasAudio);
              alert('Vừa thêm từ vựng mới thành công');`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/App.tsx', code);
