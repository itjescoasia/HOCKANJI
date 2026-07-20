import React from 'react';
import { KanjiCard } from '../types';
import { Plus, X, Check } from 'lucide-react';

interface ReviewEditFormProps {
  editForm: Partial<KanjiCard>;
  setEditForm: (form: Partial<KanjiCard>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ReviewEditForm({ editForm, setEditForm, onSave, onCancel }: ReviewEditFormProps) {
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

  return (
    <div className="w-full bg-theme-panel border border-theme-subtle p-6 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-serif text-theme-accent tracking-wider uppercase">Sửa từ vựng</h2>
        <button onClick={onCancel} className="p-2 text-theme-primary opacity-50 hover:opacity-100">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Kanji / Từ Vựng</label>
            <div className="flex gap-2">
            <input 
              value={editForm.kanji || ''} 
              onChange={e => setEditForm({...editForm, kanji: e.target.value})}
              className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent font-serif text-lg"
            />
            <button
              type="button"
              onClick={autoFillAI}
              disabled={isGeneratingAI || !editForm.kanji?.trim()}
              className="px-3 py-2 bg-theme-accent text-theme-base font-bold text-[10px] tracking-wider disabled:opacity-50 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {isGeneratingAI ? 'ĐANG TẠO...' : 'AI TỰ ĐỘNG ĐIỀN'}
            </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Hán Việt</label>
            <input 
              value={editForm.sinoVietnamese || ''} 
              onChange={e => setEditForm({...editForm, sinoVietnamese: e.target.value})}
              className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Cách đọc (Hiragana)</label>
            <input 
              value={editForm.reading || ''} 
              onChange={e => setEditForm({...editForm, reading: e.target.value})}
              className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Romaji</label>
            <input 
              value={editForm.romaji || ''} 
              onChange={e => setEditForm({...editForm, romaji: e.target.value})}
              className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Ý nghĩa</label>
            <input 
              value={editForm.meaning || ''} 
              onChange={e => setEditForm({...editForm, meaning: e.target.value})}
              className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Loại từ</label>
            <input 
              value={editForm.wordType || ''} 
              onChange={e => setEditForm({...editForm, wordType: e.target.value})}
              className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
              placeholder="VD: Danh từ, Động từ..."
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest text-theme-primary/50">Giải thích Kanji</label>
          <input 
            value={editForm.kanjiExplanation || ''} 
            onChange={e => setEditForm({...editForm, kanjiExplanation: e.target.value})}
            className="w-full bg-theme-hover border border-theme-subtle text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-theme-subtle">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase tracking-widest text-theme-accent opacity-80">Các ví dụ</label>
            <button 
              type="button" 
              onClick={() => {
                const newExamples = editForm.examples ? [...editForm.examples] : [];
                newExamples.unshift({ id: crypto.randomUUID(), sentence: '', reading: '', romaji: '', translation: '' });
                setEditForm({...editForm, examples: newExamples});
              }}
              className="p-1 rounded-sm bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors flex items-center gap-1 text-[10px]"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            {editForm.examples?.map((ex, index) => (
              <div key={ex.id || index} className="relative p-3 border border-theme-subtle bg-theme-base/50 rounded-sm flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newExamples = [...(editForm.examples || [])];
                    newExamples.splice(index, 1);
                    setEditForm({...editForm, examples: newExamples});
                  }}
                  className="absolute top-2 right-2 p-1 text-theme-primary/40 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <input 
                  value={ex.sentence || ''} 
                  onChange={e => {
                    const newExamples = [...(editForm.examples || [])];
                    newExamples[index] = { ...newExamples[index], sentence: e.target.value };
                    setEditForm({...editForm, examples: newExamples});
                  }}
                  className="w-full bg-theme-base-alt border border-theme-subtle text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent pr-8"
                  placeholder="Câu ví dụ (Tiếng Nhật)"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    value={ex.reading || ''} 
                    onChange={e => {
                      const newExamples = [...(editForm.examples || [])];
                      newExamples[index] = { ...newExamples[index], reading: e.target.value };
                      setEditForm({...editForm, examples: newExamples});
                    }}
                    className="w-full bg-theme-base-alt border border-theme-subtle text-[11px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent italic"
                    placeholder="Hiragana"
                  />
                  <input 
                    value={ex.romaji || ''} 
                    onChange={e => {
                      const newExamples = [...(editForm.examples || [])];
                      newExamples[index] = { ...newExamples[index], romaji: e.target.value };
                      setEditForm({...editForm, examples: newExamples});
                    }}
                    className="w-full bg-theme-base-alt border border-theme-subtle text-[11px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent italic"
                    placeholder="Romaji"
                  />
                </div>
                
                <input 
                  value={ex.translation || ''} 
                  onChange={e => {
                    const newExamples = [...(editForm.examples || [])];
                    newExamples[index] = { ...newExamples[index], translation: e.target.value };
                    setEditForm({...editForm, examples: newExamples});
                  }}
                  className="w-full bg-theme-base-alt border border-theme-subtle text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                  placeholder="Dịch nghĩa (Tiếng Việt)"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-theme-subtle shrink-0">
        <button 
          onClick={onSave}
          disabled={!editForm.kanji || !editForm.meaning}
          className="w-full bg-theme-accent text-theme-inverted py-3 uppercase tracking-widest text-xs font-medium hover:bg-theme-accent-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>
      </div>
    </div>
  );
}
