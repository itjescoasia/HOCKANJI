const fs = require('fs');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(/reading: data\.reading \|\| editForm\.reading/g, 'reading: data.reading !== undefined ? data.reading : editForm.reading');
  code = code.replace(/romaji: data\.romaji \|\| editForm\.romaji/g, 'romaji: data.romaji !== undefined ? data.romaji : editForm.romaji');
  code = code.replace(/meaning: data\.meaning \|\| editForm\.meaning/g, 'meaning: data.meaning !== undefined ? data.meaning : editForm.meaning');
  code = code.replace(/sinoVietnamese: data\.sinoVietnamese \|\| editForm\.sinoVietnamese/g, 'sinoVietnamese: data.sinoVietnamese !== undefined ? data.sinoVietnamese : editForm.sinoVietnamese');
  code = code.replace(/kanjiExplanation: data\.kanjiExplanation \|\| editForm\.kanjiExplanation/g, 'kanjiExplanation: data.kanjiExplanation !== undefined ? data.kanjiExplanation : editForm.kanjiExplanation');
  code = code.replace(/wordType: data\.wordType \|\| editForm\.wordType/g, 'wordType: data.wordType !== undefined ? data.wordType : editForm.wordType');

  fs.writeFileSync(filePath, code);
}

fixFile('src/components/ReviewEditForm.tsx');
fixFile('src/components/VocabList.tsx');
