import React, { useState, useEffect } from 'react';
import { KanjiExample, KanjiCard } from '../types';
import { Plus, X, AlertTriangle } from 'lucide-react';

interface AddVocabProps {
  deck?: KanjiCard[];
  onNavigateToWord?: (kanji: string) => void;
  onAdd: (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, examples?: KanjiExample[], wordType?: string, kanjiExplanation?: string, romaji?: string, forms?: { id: string, name: string, value: string }[]) => void;
}

export default function AddVocab({ deck = [], onNavigateToWord, onAdd }: AddVocabProps) {
  const [kanji, setKanji] = useState('');
  const [reading, setReading] = useState('');
  const [romaji, setRomaji] = useState('');
  const [sinoVietnamese, setSinoVietnamese] = useState('');
  const [kanjiExplanation, setKanjiExplanation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [examples, setExamples] = useState<{sentence: string, reading: string, romaji: string, translation: string}[]>([{ sentence: '', reading: '', romaji: '', translation: '' }]);
  const [forms, setForms] = useState<{name: string, value: string}[]>([]);
  const [wordType, setWordType] = useState('');
  
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  useEffect(() => {
    if (kanji.trim() && deck.some(card => card.kanji.trim().toLowerCase() === kanji.trim().toLowerCase())) {
      setDuplicateWarning(true);
    } else {
      setDuplicateWarning(false);
    }
  }, [kanji, deck]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanji.trim() || !meaning.trim()) {
      alert("Vui lòng điền đầy đủ Kanji (Từ vựng) và Ý nghĩa!");
      return;
    }
    
    if (deck.some(card => card.kanji.trim().toLowerCase() === kanji.trim().toLowerCase())) {
      alert("Từ này đã tồn tại trong Kho từ vựng! Không thể thêm từ trùng lặp.");
      return;
    }
    
    // Filter out empty examples
    const validExamples = examples.filter(ex => ex.sentence.trim() || ex.translation.trim()).map(ex => ({
      id: crypto.randomUUID(),
      sentence: ex.sentence.trim(),
      reading: ex.reading.trim(),
      romaji: ex.romaji.trim(),
      translation: ex.translation.trim()
    }));

    const validForms = forms.filter(f => f.name.trim() && f.value.trim()).map(f => ({
      id: crypto.randomUUID(),
      name: f.name.trim(),
      value: f.value.trim()
    }));
    
    onAdd(
      kanji.trim(), reading.trim(), meaning.trim(), sinoVietnamese.trim(), 
      validExamples.length > 0 ? validExamples : undefined, 
      wordType, kanjiExplanation.trim(), romaji.trim(), 
      validForms.length > 0 ? validForms : undefined
    );
    setKanji('');
    setReading('');
    setRomaji('');
    setSinoVietnamese('');
    setKanjiExplanation('');
    setMeaning('');
    setExamples([{ sentence: '', reading: '', romaji: '', translation: '' }]);
    setForms([]);
    setWordType('');
  };

  const addExampleField = () => {
    setExamples([{ sentence: '', reading: '', romaji: '', translation: '' }, ...examples]);
  };

  const removeExampleField = (index: number) => {
    const newExamples = [...examples];
    newExamples.splice(index, 1);
    if (newExamples.length === 0) {
      newExamples.push({ sentence: '', reading: '', romaji: '', translation: '' });
    }
    setExamples(newExamples);
  };

  const updateExample = (index: number, field: string, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-serif text-theme-accent mb-2 tracking-widest uppercase">Thêm từ mới</h2>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Bổ sung Kanji vào danh sách học của bạn</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-theme-panel p-8 border border-theme-subtle flex flex-col gap-6">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Kanji (Từ vựng) <span className="text-[#8b0000]">*</span></label>
          <input 
            type="text" 
            required
            value={kanji}
            onChange={e => setKanji(e.target.value)}
            className={`w-full px-5 py-4 bg-theme-base border ${duplicateWarning ? 'border-red-500' : 'border-theme-subtle'} focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-2xl font-serif text-center`}
            placeholder="語"
          />
          {duplicateWarning && (
            <div className="mt-3 flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Từ này đã có trong Kho từ vựng!</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToWord && onNavigateToWord(kanji.trim())}
                className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600 transition-colors"
              >
                Xem lại
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Cách đọc (Kunyomi / Onyomi)</label>
          <input 
            type="text" 
            value={reading}
            onChange={e => setReading(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-serif italic text-center"
            placeholder="go, kataru"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Romaji</label>
          <input 
            type="text" 
            value={romaji}
            onChange={e => setRomaji(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-serif italic text-center"
            placeholder="Romaji"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Từ loại</label>
          <select
            value={wordType}
            onChange={e => setWordType(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-center"
          >
            <option value="">-- Chọn từ loại --</option>
            <option value="Động từ nhóm I">Động từ nhóm I</option>
            <option value="Động từ nhóm II">Động từ nhóm II</option>
            <option value="Động từ nhóm III">Động từ nhóm III</option>
            <option value="Danh từ">Danh từ</option>
            <option value="Tính từ i">Tính từ i</option>
            <option value="Tính từ na">Tính từ na</option>
            <option value="Trạng từ">Trạng từ</option>
            <option value="Ngữ pháp">Ngữ pháp</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Hán Việt</label>
          <input 
            type="text" 
            value={sinoVietnamese}
            onChange={e => setSinoVietnamese(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-accent font-serif uppercase tracking-widest text-center"
            placeholder="NGỘ"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Giải thích Hán tự (Bản chất)</label>
          <textarea 
            value={kanjiExplanation}
            onChange={e => setKanjiExplanation(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-sans text-sm"
            placeholder="Giải thích nguồn gốc, cách nhớ chữ Hán..."
            rows={3}
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Ý nghĩa (Tiếng Việt) <span className="text-[#8b0000]">*</span></label>
          <input 
            type="text" 
            required
            value={meaning}
            onChange={e => setMeaning(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-serif uppercase tracking-widest text-center"
            placeholder="NGÔN NGỮ"
          />
        </div>
        
        {wordType?.includes('Động từ') && (
          <div className="pt-4 border-t border-theme-subtle">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80">Các thể</label>
              <button 
                type="button" 
                onClick={() => setForms([...forms, { name: '', value: '' }])}
                className="p-1.5 rounded-sm bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors"
                title="Thêm thể"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {forms.map((f, index) => (
                <div key={index} className="relative flex gap-4">
                  <input 
                    type="text" 
                    value={f.name}
                    onChange={e => {
                      const newForms = [...forms];
                      newForms[index].name = e.target.value;
                      setForms(newForms);
                    }}
                    className="w-1/3 px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                    placeholder="Tên thể (ví dụ: Thể て)"
                  />
                  <input 
                    type="text" 
                    value={f.value}
                    onChange={e => {
                      const newForms = [...forms];
                      newForms[index].value = e.target.value;
                      setForms(newForms);
                    }}
                    className="w-2/3 px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm pr-10"
                    placeholder="Sau khi chia (ví dụ: 教えて)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newForms = [...forms];
                      newForms.splice(index, 1);
                      setForms(newForms);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-full text-theme-primary/50 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-theme-subtle">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80">Các ví dụ (Tiếng Nhật - Tiếng Việt)</label>
            <button 
              type="button" 
              onClick={addExampleField}
              className="p-1.5 rounded-sm bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors"
              title="Thêm ví dụ"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col gap-6">
            {examples.map((ex, index) => (
              <div key={index} className="relative p-4 border border-theme-subtle bg-theme-base-alt rounded-sm">
                <button
                  type="button"
                  onClick={() => removeExampleField(index)}
                  className="absolute -top-3 -right-3 p-1.5 rounded-full bg-theme-panel border border-theme-subtle text-theme-primary/50 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={ex.sentence}
                    onChange={e => updateExample(index, 'sentence', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-panel border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-light text-center"
                    placeholder="Câu ví dụ (Tiếng Nhật)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={ex.reading}
                      onChange={e => updateExample(index, 'reading', e.target.value)}
                      className="w-full px-4 py-2 bg-theme-panel border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm font-serif italic text-center"
                      placeholder="Hiragana"
                    />
                    <input 
                      type="text" 
                      value={ex.romaji}
                      onChange={e => updateExample(index, 'romaji', e.target.value)}
                      className="w-full px-4 py-2 bg-theme-panel border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm font-serif italic text-center"
                      placeholder="Romaji"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={ex.translation}
                    onChange={e => updateExample(index, 'translation', e.target.value)}
                    className="w-full px-4 py-2 bg-theme-panel border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-light text-center"
                    placeholder="Dịch nghĩa (Tiếng Việt)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button 
          type="submit"
          disabled={!kanji.trim() || !meaning.trim()}
          className="mt-6 bg-theme-hover border border-theme-accent disabled:border-theme-subtle disabled:text-theme-inverted hover:disabled:bg-theme-hover hover:disabled:text-theme-inverted text-theme-accent hover:bg-theme-accent hover:text-theme-inverted py-4 uppercase tracking-[0.2em] text-[11px] transition-all font-medium"
        >
          Thêm vào danh sách
        </button>
      </form>
    </div>
  );
}
