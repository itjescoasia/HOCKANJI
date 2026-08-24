const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Replace validExamples map
code = code.replace(/translation:\s*String\(ex\.translation\s*\|\|\s*""\)\.trim\(\)\s*\}\)\)/g, 'translation: String(ex.translation || "").trim(), audioUrl: ex.audioUrl || null, hasAudio: !!ex.audioUrl }))');

// Replace validForms map
code = code.replace(/value:\s*String\(f\.value\s*\|\|\s*""\)\.trim\(\)\s*\}\)\)/g, 'value: String(f.value || "").trim(), audioUrl: f.audioUrl || null, hasAudio: !!f.audioUrl }))');

// Replace onUpdate call
code = code.replace(/wordType:\s*String\(editForm\.wordType\s*\|\|\s*""\)\.trim\(\)\s*\|\|\s*''\s*\}\);/g, "wordType: String(editForm.wordType || '').trim() || '', audioUrl: editForm.audioUrl || null, hasAudio: !!editForm.audioUrl });");

fs.writeFileSync('src/components/VocabList.tsx', code);
