const fs = require('fs');
let file = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

if (!file.includes('isGeneratingAI')) {
  file = file.replace(
    '  const [isFetchingOjad, setIsFetchingOjad] = useState(false);',
    `  const [isFetchingOjad, setIsFetchingOjad] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const autoFillAI = async () => {
    if (!editForm.kanji?.trim()) {
      alert('Vui lòng nhập từ (Kanji/Hiragana) trước khi dùng AI tự động điền.');
      return;
    }
    
    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/generate-vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: editForm.kanji.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi lấy dữ liệu từ AI');
      }

      setEditForm({
        ...editForm,
        reading: data.reading || editForm.reading,
        romaji: data.romaji || editForm.romaji,
        meaning: data.meaning || editForm.meaning,
        sinoVietnamese: data.sinoVietnamese || editForm.sinoVietnamese,
        kanjiExplanation: data.kanjiExplanation || editForm.kanjiExplanation,
        wordType: data.wordType || editForm.wordType,
        forms: data.forms && data.forms.length > 0 ? data.forms : editForm.forms,
        examples: data.examples && data.examples.length > 0 ? data.examples : editForm.examples
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Có lỗi xảy ra khi gọi AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };`
  );

  file = file.replace(
    `                          <input 
                            value={editForm.kanji} 
                            onChange={e => setEditForm({...editForm, kanji: e.target.value})}
                            className="w-full bg-theme-base-alt border border-theme-subtle text-xl font-serif text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                            placeholder="Kanji"
                          />`,
    `                          <div className="flex flex-col gap-2">
                            <input 
                              value={editForm.kanji} 
                              onChange={e => setEditForm({...editForm, kanji: e.target.value})}
                              className="w-full bg-theme-base-alt border border-theme-subtle text-xl font-serif text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                              placeholder="Kanji"
                            />
                            <button
                              type="button"
                              onClick={autoFillAI}
                              disabled={isGeneratingAI || !editForm.kanji?.trim()}
                              className="w-full px-3 py-2 bg-theme-accent text-theme-base font-bold text-[10px] tracking-wider disabled:opacity-50 hover:opacity-90 transition-opacity whitespace-nowrap text-center"
                            >
                              {isGeneratingAI ? 'ĐANG TẠO...' : 'AI TỰ ĐỘNG ĐIỀN'}
                            </button>
                          </div>`
  );

  fs.writeFileSync('src/components/VocabList.tsx', file);
  console.log("Updated VocabList");
} else {
  console.log("Already updated");
}
