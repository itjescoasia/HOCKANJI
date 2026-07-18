import React, { useState, useEffect } from 'react';
import { KanjiExample, KanjiCard } from '../types';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { toRomaji } from 'wanakana';

interface AddVocabProps {
  deck?: KanjiCard[];
  onNavigateToWord?: (kanji: string) => void;
  onAdd: (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, examples?: KanjiExample[], wordType?: string, kanjiExplanation?: string, romaji?: string, forms?: { id: string, name: string, value: string, reading?: string, romaji?: string }[]) => void;
}

export default function AddVocab({ deck = [], onNavigateToWord, onAdd }: AddVocabProps) {
  const [kanji, setKanji] = useState('');
  const [reading, setReading] = useState('');
  const [romaji, setRomaji] = useState('');
  const [sinoVietnamese, setSinoVietnamese] = useState('');
  const [kanjiExplanation, setKanjiExplanation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [examples, setExamples] = useState<{sentence: string, reading: string, romaji: string, translation: string}[]>([{ sentence: '', reading: '', romaji: '', meaning: '', translation: '' }]);
  const [forms, setForms] = useState<{name: string, value: string, reading: string, romaji: string, meaning: string}[]>([]);
  const [wordType, setWordType] = useState('');
  
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (kanji.trim() && deck.some(card => card.kanji.trim().toLowerCase() === kanji.trim().toLowerCase())) {
      setDuplicateWarning(true);
    } else {
      setDuplicateWarning(false);
    }
  }, [kanji, deck]);

  
  const autoFillAI = async () => {
    if (!kanji.trim()) {
      alert('Vui lòng nhập từ tiếng Nhật vào ô Kanji (Từ vựng) trước khi dùng AI tự động điền.');
      return;
    }
    
    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/generate-vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: kanji.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi lấy dữ liệu từ AI');
      }

      if (data.reading) setReading(data.reading);
      if (data.romaji) setRomaji(data.romaji);
      if (data.meaning) setMeaning(data.meaning);
      if (data.sinoVietnamese) setSinoVietnamese(data.sinoVietnamese);
      if (data.kanjiExplanation) setKanjiExplanation(data.kanjiExplanation);
      if (data.examples && Array.isArray(data.examples) && data.examples.length > 0) {
        setExamples(data.examples.map((ex: any) => ({
          sentence: ex.sentence || '',
          reading: ex.reading || '',
          romaji: ex.romaji || '',
          translation: ex.translation || ''
        })));
      }
      if (data.forms && Array.isArray(data.forms) && data.forms.length > 0) {
        setForms(data.forms.map((f: any) => ({
          name: f.name || '',
          value: f.value || '',
          reading: f.reading || '',
          romaji: f.romaji || '',
          meaning: f.meaning || ''
        })));
      }

      if (data.wordType) {
         setWordType(data.wordType);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Có lỗi xảy ra khi dùng AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleWordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWordType = e.target.value;
    setWordType(newWordType);
    if (newWordType.includes('Động từ')) {
      if (forms.length === 0) {
        setForms([
          { name: 'Thể lịch sự (thể ます)', value: '', reading: '', romaji: '', meaning: '' },
          { name: 'Thể từ điển (thể る)', value: '', reading: '', romaji: '', meaning: '' },
          { name: 'Thể phủ định (thể ない)', value: '', reading: '', romaji: '', meaning: '' },
          { name: 'Thể て', value: '', reading: '', romaji: '', meaning: '', meaning: '' },
          { name: 'Thể quá khứ (thể た)', value: '', reading: '', romaji: '', meaning: '' },
          { name: 'Thể ý chí (thể よう)', value: '', reading: '', romaji: '', meaning: '' },
          { name: 'Thể mệnh lệnh', value: '', reading: '', romaji: '', meaning: '', meaning: '' },
          { name: 'Thể cấm chỉ (thể な)', value: '', reading: '', romaji: '', meaning: '' },
          { name: 'Thể khả năng', value: '', reading: '', romaji: '', meaning: '', meaning: '' },
          { name: 'Thể sai khiến', value: '', reading: '', romaji: '', meaning: '', meaning: '' },
          { name: 'Thể bị động', value: '', reading: '', romaji: '', meaning: '', meaning: '' },
          { name: 'Thể bị động sai khiến', value: '', reading: '', romaji: '', meaning: '', meaning: '' }
        ]);
      }
    }
  };

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
      name: f.name.trim(), reading: String(f.reading || "").trim(), romaji: String(f.romaji || "").trim(), meaning: String(f.meaning || "").trim(),
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
    setExamples([{ sentence: '', reading: '', romaji: '', meaning: '', translation: '' }]);
    setForms([]);
    setWordType('');
  };

  const addExampleField = () => {
    setExamples([{ sentence: '', reading: '', romaji: '', meaning: '', translation: '' }, ...examples]);
  };

  const removeExampleField = (index: number) => {
    const newExamples = [...examples];
    newExamples.splice(index, 1);
    if (newExamples.length === 0) {
      newExamples.push({ sentence: '', reading: '', romaji: '', meaning: '', translation: '' });
    }
    setExamples(newExamples);
  };

  const updateExample = (index: number, field: string, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-serif text-theme-accent mb-2 tracking-widest uppercase">Thêm từ mới</h2>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Bổ sung Kanji vào danh sách học của bạn</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-theme-panel p-8 border border-theme-subtle flex flex-col gap-6">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Kanji (Từ vựng) <span className="text-[#8b0000]">*</span></label>
          <div className="flex gap-2">
            <input 
              type="text" 
              required
              value={kanji}
              onChange={e => setKanji(e.target.value)}
              className={`flex-1 px-5 py-4 bg-theme-base border ${duplicateWarning ? 'border-red-500' : 'border-theme-subtle'} focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-2xl font-serif text-center`}
              placeholder="語"
            />
            <button
              type="button"
              onClick={autoFillAI}
              disabled={isGeneratingAI || !kanji.trim()}
              className="px-4 py-4 bg-theme-accent text-theme-base font-bold text-xs tracking-wider disabled:opacity-50 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {isGeneratingAI ? 'ĐANG TẠO...' : 'AI TỰ ĐỘNG ĐIỀN'}
            </button>
          </div>
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
            onChange={handleWordTypeChange}
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
        
        {(() => {
          const isVerbs = wordType?.includes('Động từ');
          const isAdjectivesOrNoun = wordType === 'Danh từ' || wordType === 'Tính từ i' || wordType === 'Tính từ na';
          const isFormsEnabled = isVerbs || isAdjectivesOrNoun;
          const formsLabel = isVerbs ? 'Các thể' : 'Các thì';
          const formsNamePlaceholder = isVerbs ? 'Tên thể (ví dụ: Thể て)' : 'Tên thì (ví dụ: Quá khứ)';
          const formsValuePlaceholder = isVerbs ? 'Sau khi chia (ví dụ: 教えて)' : 'Sau khi chia (ví dụ: だった)';

          if (!isFormsEnabled) return null;

          return (
            <div className="pt-4 border-t border-theme-subtle">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80">{formsLabel}</label>
                  
                </div>
                <button 
                  type="button" 
                  onClick={() => setForms([...forms, { name: '', value: '', reading: '', romaji: '', meaning: '', meaning: '' }])}
                  className="p-1.5 rounded-sm bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors"
                  title="Thêm thể"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {forms.map((f, index) => (
                  <div key={index} className="relative flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 border border-theme-subtle/50 rounded-lg bg-theme-panel/30">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={f.name}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].name = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm font-bold"
                        placeholder={formsNamePlaceholder}
                      />
                      <input 
                        type="text" 
                        value={f.value}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].value = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                        placeholder={formsValuePlaceholder}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={f.reading || ''}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].reading = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                        placeholder="Phát âm (Hiragana)"
                      />
                      <input 
                        type="text" 
                        value={f.romaji || ''}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].romaji = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                        placeholder="Phát âm (Romaji)"
                      />
                      <input 
                        type="text" 
                        value={f.meaning || ''}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].meaning = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                        placeholder="Nghĩa (Tiếng Việt)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newForms = [...forms];
                        newForms.splice(index, 1);
                        setForms(newForms);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-theme-panel text-theme-primary/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Xóa thể"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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
