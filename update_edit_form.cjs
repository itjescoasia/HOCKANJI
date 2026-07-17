const fs = require('fs');
let file = fs.readFileSync('src/components/ReviewEditForm.tsx', 'utf8');

if (!file.includes('isGeneratingAI')) {
  file = file.replace(
    `export default function ReviewEditForm({ editForm, setEditForm, onSave, onCancel }: ReviewEditFormProps) {`,
    `export default function ReviewEditForm({ editForm, setEditForm, onSave, onCancel }: ReviewEditFormProps) {
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);

  const autoFillAI = async () => {
    if (!editForm.kanji?.trim()) {
      alert('Vui lòng nhập từ tiếng Nhật vào ô Kanji (Từ vựng) trước khi dùng AI tự động điền.');
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
  };
`
  );

  file = file.replace(
    `<label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Kanji / Từ Vựng</label>`,
    `<label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Kanji / Từ Vựng</label>
            <div className="flex gap-2">`
  );
  
  file = file.replace(
    `className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent font-serif text-lg"
            />`,
    `className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent font-serif text-lg"
            />
            <button
              type="button"
              onClick={autoFillAI}
              disabled={isGeneratingAI || !editForm.kanji?.trim()}
              className="px-3 py-2 bg-theme-accent text-theme-base font-bold text-[10px] tracking-wider disabled:opacity-50 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {isGeneratingAI ? 'ĐANG TẠO...' : 'AI TỰ ĐỘNG ĐIỀN'}
            </button>
            </div>`
  );

  fs.writeFileSync('src/components/ReviewEditForm.tsx', file);
  console.log("Updated ReviewEditForm");
} else {
  console.log("Already updated");
}
