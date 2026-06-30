import React, { useState } from 'react';
import { KanjiExample } from '../types';
import { Plus, X } from 'lucide-react';

interface AddVocabProps {
  onAdd: (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, examples?: KanjiExample[], wordType?: string, kanjiExplanation?: string, romaji?: string) => void;
}

export default function AddVocab({ onAdd }: AddVocabProps) {
  const [kanji, setKanji] = useState('');
  const [reading, setReading] = useState('');
  const [romaji, setRomaji] = useState('');
  const [sinoVietnamese, setSinoVietnamese] = useState('');
  const [kanjiExplanation, setKanjiExplanation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [examples, setExamples] = useState<{sentence: string, reading: string, romaji: string, translation: string}[]>([{ sentence: '', reading: '', romaji: '', translation: '' }]);
  const [wordType, setWordType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanji.trim() || !meaning.trim()) {
      alert("Vui lòng điền đầy đủ Kanji (Từ vựng) và Ý nghĩa!");
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
    
    onAdd(kanji.trim(), reading.trim(), meaning.trim(), sinoVietnamese.trim(), validExamples.length > 0 ? validExamples : undefined, wordType, kanjiExplanation.trim(), romaji.trim());
    setKanji('');
    setReading('');
    setRomaji('');
    setSinoVietnamese('');
    setKanjiExplanation('');
    setMeaning('');
    setExamples([{ sentence: '', reading: '', romaji: '', translation: '' }]);
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
            className="w-full px-5 py-4 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-2xl font-serif text-center"
            placeholder="語"
          />
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
