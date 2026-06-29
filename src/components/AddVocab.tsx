import React, { useState } from 'react';

interface AddVocabProps {
  onAdd: (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, example?: string, exampleTranslation?: string, wordType?: string, kanjiExplanation?: string, romaji?: string) => void;
}

export default function AddVocab({ onAdd }: AddVocabProps) {
  const [kanji, setKanji] = useState('');
  const [reading, setReading] = useState('');
  const [romaji, setRomaji] = useState('');
  const [sinoVietnamese, setSinoVietnamese] = useState('');
  const [kanjiExplanation, setKanjiExplanation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [wordType, setWordType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanji.trim() || !meaning.trim()) return;
    onAdd(kanji.trim(), reading.trim(), meaning.trim(), sinoVietnamese.trim(), example.trim(), exampleTranslation.trim(), wordType, kanjiExplanation.trim(), romaji.trim());
    setKanji('');
    setReading('');
    setRomaji('');
    setSinoVietnamese('');
    setKanjiExplanation('');
    setMeaning('');
    setExample('');
    setExampleTranslation('');
    setWordType('');
    
    // Simple visual feedback could go here, but clearing the form is enough for now
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
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Ví dụ (Tiếng Nhật)</label>
          <input 
            type="text" 
            value={example}
            onChange={e => setExample(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-light text-center"
            placeholder="Ví dụ: 日本語"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Dịch nghĩa ví dụ (Tiếng Việt)</label>
          <input 
            type="text" 
            value={exampleTranslation}
            onChange={e => setExampleTranslation(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-light text-center"
            placeholder="Ví dụ: Tiếng Nhật"
          />
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
