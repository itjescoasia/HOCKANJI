import React, { useState } from 'react';

interface AddVocabProps {
  onAdd: (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, example?: string, exampleTranslation?: string, wordType?: string) => void;
}

export default function AddVocab({ onAdd }: AddVocabProps) {
  const [kanji, setKanji] = useState('');
  const [reading, setReading] = useState('');
  const [sinoVietnamese, setSinoVietnamese] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [wordType, setWordType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanji.trim() || !meaning.trim()) return;
    onAdd(kanji.trim(), reading.trim(), meaning.trim(), sinoVietnamese.trim(), example.trim(), exampleTranslation.trim(), wordType);
    setKanji('');
    setReading('');
    setSinoVietnamese('');
    setMeaning('');
    setExample('');
    setExampleTranslation('');
    setWordType('');
    
    // Simple visual feedback could go here, but clearing the form is enough for now
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-serif text-[#c5a059] mb-2 tracking-widest uppercase">Thêm từ mới</h2>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Bổ sung Kanji vào danh sách học của bạn</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-[#121212] p-8 border border-[#2a2a2a] flex flex-col gap-6">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#c5a059] opacity-80 mb-2">Kanji (Từ vựng) <span className="text-[#8b0000]">*</span></label>
          <input 
            type="text" 
            required
            value={kanji}
            onChange={e => setKanji(e.target.value)}
            className="w-full px-5 py-4 bg-[#0a0a0a] border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059] transition-colors text-white text-2xl font-serif text-center"
            placeholder="語"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#c5a059] opacity-80 mb-2">Cách đọc (Kunyomi / Onyomi)</label>
          <input 
            type="text" 
            value={reading}
            onChange={e => setReading(e.target.value)}
            className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059] transition-colors text-[#d4d4d4] font-serif italic text-center"
            placeholder="go, kataru"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#c5a059] opacity-80 mb-2">Từ loại</label>
          <select
            value={wordType}
            onChange={e => setWordType(e.target.value)}
            className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059] transition-colors text-[#d4d4d4] text-center"
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
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#c5a059] opacity-80 mb-2">Hán Việt</label>
          <input 
            type="text" 
            value={sinoVietnamese}
            onChange={e => setSinoVietnamese(e.target.value)}
            className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059] transition-colors text-[#c5a059] font-serif uppercase tracking-widest text-center"
            placeholder="NGỘ"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#c5a059] opacity-80 mb-2">Ý nghĩa (Tiếng Việt) <span className="text-[#8b0000]">*</span></label>
          <input 
            type="text" 
            required
            value={meaning}
            onChange={e => setMeaning(e.target.value)}
            className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059] transition-colors text-white font-serif uppercase tracking-widest text-center"
            placeholder="NGÔN NGỮ"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#c5a059] opacity-80 mb-2">Ví dụ (Tiếng Nhật)</label>
          <input 
            type="text" 
            value={example}
            onChange={e => setExample(e.target.value)}
            className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059] transition-colors text-[#d4d4d4] font-light text-center"
            placeholder="Ví dụ: 日本語"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#c5a059] opacity-80 mb-2">Dịch nghĩa ví dụ (Tiếng Việt)</label>
          <input 
            type="text" 
            value={exampleTranslation}
            onChange={e => setExampleTranslation(e.target.value)}
            className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059] transition-colors text-[#d4d4d4] font-light text-center"
            placeholder="Ví dụ: Tiếng Nhật"
          />
        </div>
        <button 
          type="submit"
          disabled={!kanji.trim() || !meaning.trim()}
          className="mt-6 bg-[#1a1a1a] border border-[#c5a059] disabled:border-[#2a2a2a] disabled:text-[#2a2a2a] hover:disabled:bg-[#1a1a1a] hover:disabled:text-[#2a2a2a] text-[#c5a059] hover:bg-[#c5a059] hover:text-black py-4 uppercase tracking-[0.2em] text-[11px] transition-all font-medium"
        >
          Thêm vào danh sách
        </button>
      </form>
    </div>
  );
}
