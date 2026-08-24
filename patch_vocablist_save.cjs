const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetStr = `  const saveEdit = () => {
    if (editingId && editForm.kanji && editForm.meaning && onUpdate) {
      
      const validExamples = editForm.examples?.filter(ex => String(ex.sentence || "").trim() || String(ex.translation || "").trim()).map(ex => ({
        id: ex.id || crypto.randomUUID(),
        sentence: String(ex.sentence || "").trim(),
        reading: String(ex.reading || "").trim() || '',
        romaji: String(ex.romaji || "").trim() || '',
        translation: String(ex.translation || "").trim()
      })) || [];
      
      const validForms = editForm.forms?.filter(f => String(f.name || "").trim() && String(f.value || "").trim()).map(f => ({
        id: f.id || crypto.randomUUID(),
        name: String(f.name || "").trim(), reading: String(f.reading || "").trim() || "", romaji: String(f.romaji || "").trim() || "", meaning: String(f.meaning || "").trim() || "",
        value: String(f.value || "").trim()
      })) || [];
      
      onUpdate(editingId, {
        kanji: String(editForm.kanji || "").trim(),
        reading: String(editForm.reading || "").trim() || '',
        romaji: String(editForm.romaji || "").trim() || '',
        sinoVietnamese: String(editForm.sinoVietnamese || "").trim() || '',
        kanjiExplanation: String(editForm.kanjiExplanation || "").trim() || '',
        meaning: String(editForm.meaning || "").trim(),
        example: String(editForm.example || "").trim() || '',
        exampleTranslation: String(editForm.exampleTranslation || "").trim() || '',
        examples: validExamples,
        forms: validForms,
        wordType: String(editForm.wordType || "").trim() || ''
      });
      setEditingId(null);
    }
  };`;

const replacementStr = `  const saveEdit = () => {
    if (editingId && editForm.kanji && editForm.meaning && onUpdate) {
      
      const validExamples = editForm.examples?.filter(ex => String(ex.sentence || "").trim() || String(ex.translation || "").trim()).map(ex => ({
        id: ex.id || crypto.randomUUID(),
        sentence: String(ex.sentence || "").trim(),
        reading: String(ex.reading || "").trim() || '',
        romaji: String(ex.romaji || "").trim() || '',
        translation: String(ex.translation || "").trim(),
        audioUrl: ex.audioUrl || null,
        hasAudio: !!ex.audioUrl
      })) || [];
      
      const validForms = editForm.forms?.filter(f => String(f.name || "").trim() && String(f.value || "").trim()).map(f => ({
        id: f.id || crypto.randomUUID(),
        name: String(f.name || "").trim(), reading: String(f.reading || "").trim() || "", romaji: String(f.romaji || "").trim() || "", meaning: String(f.meaning || "").trim() || "",
        value: String(f.value || "").trim(),
        audioUrl: f.audioUrl || null,
        hasAudio: !!f.audioUrl
      })) || [];
      
      onUpdate(editingId, {
        kanji: String(editForm.kanji || "").trim(),
        reading: String(editForm.reading || "").trim() || '',
        romaji: String(editForm.romaji || "").trim() || '',
        sinoVietnamese: String(editForm.sinoVietnamese || "").trim() || '',
        kanjiExplanation: String(editForm.kanjiExplanation || "").trim() || '',
        meaning: String(editForm.meaning || "").trim(),
        example: String(editForm.example || "").trim() || '',
        exampleTranslation: String(editForm.exampleTranslation || "").trim() || '',
        examples: validExamples,
        forms: validForms,
        wordType: String(editForm.wordType || "").trim() || '',
        audioUrl: editForm.audioUrl || null,
        hasAudio: !!editForm.audioUrl
      });
      setEditingId(null);
    }
  };`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/VocabList.tsx', code);
