import { KanjiCard, KanjiExample } from '../types';
import { Trash2, Search, Upload, Download, Edit2, Check, X, Plus, Volume2 } from 'lucide-react';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { renderExampleHighlight } from '../utils/highlight';

interface VocabListProps {
  deck: KanjiCard[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Pick<KanjiCard, 'kanji' | 'reading' | 'romaji' | 'meaning' | 'sinoVietnamese' | 'kanjiExplanation' | 'example' | 'exampleTranslation' | 'examples' | 'wordType' | 'forms'>>) => void;
  onImport: (cards: { kanji: string; reading: string; romaji?: string; meaning: string; sinoVietnamese?: string; kanjiExplanation?: string; example?: string; exampleTranslation?: string; wordType?: string }[]) => Promise<{added: number, updated: number}>;
  initialSearchQuery?: string;
}

function VocabCardExamples({ card, deck, playAudio }: { card: KanjiCard; deck: KanjiCard[]; playAudio: (e: React.MouseEvent, text: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!card.examples || card.examples.length === 0) return null;

  const ex = card.examples[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : card.examples!.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev < card.examples!.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="mt-3 space-y-2 border-t border-theme-subtle pt-3 max-w-[200px] sm:max-w-md">
      <div className="bg-theme-base-alt p-2 rounded-sm border border-theme-subtle group/ex relative">
        <div className="text-[11px] text-theme-primary opacity-80 mb-1 flex items-start gap-2 justify-between">
          <span title={ex.sentence}>{renderExampleHighlight(ex.sentence, card.kanji || card.reading, deck, card)}</span>
          <button
            onClick={(e) => playAudio(e, ex.sentence)}
            className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-0 group-hover/ex:opacity-100 shrink-0 -mt-0.5"
            title="Nghe câu ví dụ"
          >
            <Volume2 className="w-3 h-3" />
          </button>
        </div>
        {(ex.reading || ex.romaji) && (
          <div className="flex gap-2 mb-1">
            {ex.reading && <span className="text-[10px] text-theme-primary opacity-60 italic">{ex.reading}</span>}
            {ex.romaji && <span className="text-[10px] text-theme-primary opacity-60 italic">{ex.romaji}</span>}
          </div>
        )}
        <div className="text-[10px] text-theme-accent opacity-70 italic" title={ex.translation}>{ex.translation}</div>
      </div>
      
      {card.examples.length > 1 && (
        <div className="flex justify-between items-center text-[10px] text-theme-primary/50 mt-1">
          <button onClick={handlePrev} className="px-2 py-0.5 hover:bg-theme-hover hover:text-theme-primary rounded transition-colors">&larr; Trước</button>
          <span>{currentIndex + 1} / {card.examples.length}</span>
          <button onClick={handleNext} className="px-2 py-0.5 hover:bg-theme-hover hover:text-theme-primary rounded transition-colors">Tiếp &rarr;</button>
        </div>
      )}
    </div>
  );
}

export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '' }: VocabListProps) {
  const [search, setSearch] = useState(initialSearchQuery);
  const [filterType, setFilterType] = useState('all');
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Pick<KanjiCard, 'kanji' | 'reading' | 'romaji' | 'meaning' | 'sinoVietnamese' | 'kanjiExplanation' | 'example' | 'exampleTranslation' | 'examples' | 'wordType' | 'forms'>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const startEdit = (card: KanjiCard) => {
    setEditingId(card.id);
    setEditForm({
      kanji: card.kanji,
      reading: card.reading || '',
      romaji: card.romaji || '',
      sinoVietnamese: card.sinoVietnamese || '',
      kanjiExplanation: card.kanjiExplanation || '',
      meaning: card.meaning,
      example: card.example || '',
      exampleTranslation: card.exampleTranslation || '',
      examples: card.examples ? JSON.parse(JSON.stringify(card.examples)) : [], // Deep copy
      forms: card.forms ? JSON.parse(JSON.stringify(card.forms)) : [], // Deep copy
      wordType: card.wordType || '',
    });
  };

  const saveEdit = () => {
    if (editingId && editForm.kanji && editForm.meaning && onUpdate) {
      
      const validExamples = editForm.examples?.filter(ex => ex.sentence.trim() || ex.translation.trim()).map(ex => ({
        id: ex.id || crypto.randomUUID(),
        sentence: ex.sentence.trim(),
        reading: ex.reading?.trim() || '',
        romaji: ex.romaji?.trim() || '',
        translation: ex.translation.trim()
      })) || [];
        
      const validForms = editForm.forms?.filter(f => f.name.trim() && f.value.trim()).map(f => ({
        id: f.id || crypto.randomUUID(),
        name: f.name.trim(),
        value: f.value.trim()
      })) || [];
        
      onUpdate(editingId, {
        kanji: editForm.kanji.trim(),
        reading: editForm.reading?.trim() || '',
        romaji: editForm.romaji?.trim() || '',
        sinoVietnamese: editForm.sinoVietnamese?.trim() || '',
        kanjiExplanation: editForm.kanjiExplanation?.trim() || '',
        meaning: editForm.meaning.trim(),
        example: editForm.example?.trim() || '',
        exampleTranslation: editForm.exampleTranslation?.trim() || '',
        examples: validExamples,
        forms: validForms,
        wordType: editForm.wordType?.trim() || ''
      });
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredDeck = deck.filter(c => {
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return filterType === 'all' || c.wordType === filterType;

    const stem = c.kanji ? c.kanji.replace(/[ぁ-ん]+$/, '') : '';
    
    const matchesSearch = c.kanji.toLowerCase().includes(searchLower) || 
                          c.meaning.toLowerCase().includes(searchLower) ||
                          c.reading.toLowerCase().includes(searchLower) ||
                          (c.romaji && c.romaji.toLowerCase().includes(searchLower)) ||
                          (c.forms && c.forms.some(f => f.value.toLowerCase().includes(searchLower))) ||
                          (stem && stem.length > 0 && searchLower.includes(stem.toLowerCase()));
                          
    const matchesFilter = filterType === 'all' || c.wordType === filterType;
    return matchesSearch && matchesFilter;
  });

  const uniqueWordTypes = Array.from(new Set(deck.map(c => c.wordType).filter(Boolean)));

  const handleExport = () => {
    const data = deck.map(d => ({
      Kanji: d.kanji,
      Reading: d.reading,
      "Hán Việt": d.sinoVietnamese || '',
      "Từ loại": d.wordType || '',
      Meaning: d.meaning,
      Example: d.example || '',
      "Ví dụ (Dịch)": d.exampleTranslation || ''
    }));
    
    const ws = data.length > 0 
      ? XLSX.utils.json_to_sheet(data) 
      : XLSX.utils.json_to_sheet([], { header: ["Kanji", "Reading", "Hán Việt", "Từ loại", "Meaning", "Example", "Ví dụ (Dịch)"] });
      
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vocab");
    XLSX.writeFile(wb, "KanjiFlow_Vocab.xlsx");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const importedCards = data.map((row: any) => ({
          kanji: String(row.Kanji || row.kanji || '').trim(),
          reading: String(row.Reading || row.reading || '').trim(),
          meaning: String(row.Meaning || row.meaning || '').trim(),
          wordType: String(row['Từ loại'] || row.wordType || row.Từ_loại || '').trim(),
          sinoVietnamese: String(row['Hán Việt'] || row.hanviet || row.sinoVietnamese || '').trim(),
          example: String(row.Example || row.example || row['Ví dụ'] || '').trim(),
          exampleTranslation: String(row['Ví dụ (Dịch)'] || row.exampleTranslation || row.ExampleTranslation || '').trim()
        })).filter(c => c.kanji !== '');

        if (importedCards.length > 0) {
          const result = await onImport(importedCards);
          alert(`Đã thêm ${result.added} từ vựng mới và cập nhật thông tin cho ${result.updated} từ đã có.`);
        } else {
          alert('Không tìm thấy từ vựng hợp lệ trong file.');
        }
      } catch (err) {
        console.error("Lỗi khi import file Excel:", err);
        alert('Có lỗi xảy ra khi đọc file Excel.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-theme-accent mb-2 tracking-widest uppercase">Kho từ vựng</h2>
          <div className="flex items-center gap-4">
            <span className="text-theme-primary opacity-50 text-[10px] uppercase tracking-widest">Tổng cộng {deck.length} từ đã được thêm</span>
            <div className="h-4 w-px bg-theme-active"></div>
            <button
              onClick={handleExport}
              className="text-[10px] uppercase tracking-widest text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Xuất Excel
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="text-[10px] uppercase tracking-widest text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors flex items-center gap-1"
            >
              <Upload className="w-3 h-3" /> {isImporting ? 'Đang Import...' : 'Nhập Excel'}
            </button>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-theme-base-alt border border-theme-subtle text-theme-primary focus:outline-none focus:border-theme-accent transition-colors rounded-none text-sm w-full sm:w-auto min-w-[150px]"
          >
            <option value="all">Tất cả loại từ</option>
            {uniqueWordTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-theme-accent opacity-50" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm Kanji, nghĩa, romaji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-2 bg-theme-base-alt border border-theme-subtle text-theme-primary w-full sm:w-72 focus:outline-none focus:border-theme-accent transition-colors rounded-none placeholder:opacity-30 text-sm"
            />
          </div>
        </div>
      </div>
      
      {deck.length === 0 ? (
        <div className="bg-theme-panel border border-theme-subtle p-16 text-center shadow-lg">
          <div className="w-16 h-16 bg-theme-hover border border-theme-subtle flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-theme-accent opacity-50" />
          </div>
          <p className="text-lg font-serif text-theme-accent tracking-widest uppercase mb-2">Chưa có từ vựng nào</p>
          <p className="text-theme-primary opacity-50 max-w-md mx-auto text-sm leading-relaxed tracking-wide">Hãy thêm từ vựng mới để bắt đầu quá trình học ứng dụng Spaced Repetition nhé.</p>
        </div>
      ) : filteredDeck.length === 0 ? (
        <div className="bg-theme-panel border border-theme-subtle p-16 text-center">
          <p className="text-theme-primary opacity-50 text-sm tracking-wide">Không tìm thấy kết quả phù hợp với "{search}"</p>
        </div>
      ) : (
        <div className="bg-theme-panel border border-theme-subtle overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-theme-hover border-b border-theme-subtle">
                  <th className="px-8 py-4 text-[10px] text-theme-accent opacity-70 uppercase tracking-widest font-normal">Kanji</th>
                  <th className="px-8 py-4 text-[10px] text-theme-accent opacity-70 uppercase tracking-widest font-normal">Cách đọc / Nghĩa</th>
                  <th className="px-8 py-4 text-[10px] text-theme-accent opacity-70 uppercase tracking-widest font-normal">Tiến trình (SRS)</th>
                  <th className="px-8 py-4 text-[10px] text-theme-accent opacity-70 uppercase tracking-widest font-normal text-right">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {filteredDeck.map((card) => {
                  const endOfToday = new Date();
                  endOfToday.setHours(23, 59, 59, 999);
                  const isDue = card.nextReviewDate <= endOfToday.getTime();
                  const isEditing = editingId === card.id;

                  if (isEditing) {
                    return (
                      <tr key={card.id} className="bg-theme-hover shadow-inner">
                        <td className="px-4 py-4 w-32 align-top">
                          <input 
                            value={editForm.kanji} 
                            onChange={e => setEditForm({...editForm, kanji: e.target.value})}
                            className="w-full bg-theme-base-alt border border-theme-subtle text-xl font-serif text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                            placeholder="Kanji"
                          />
                        </td>
                        <td className="px-4 py-4 min-w-[250px] align-top">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <input 
                                value={editForm.reading} 
                                onChange={e => setEditForm({...editForm, reading: e.target.value})}
                                className="flex-1 bg-theme-base-alt border border-theme-subtle text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                placeholder="Cách đọc"
                              />
                              <input 
                                value={editForm.romaji || ''} 
                                onChange={e => setEditForm({...editForm, romaji: e.target.value})}
                                className="w-24 bg-theme-base-alt border border-theme-subtle text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                placeholder="Romaji"
                              />
                              <select 
                                value={editForm.wordType} 
                                onChange={e => setEditForm({...editForm, wordType: e.target.value})}
                                className="w-32 bg-theme-base-alt border border-theme-subtle text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent appearance-none"
                              >
                                <option value="">Loại từ</option>
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
                              <input 
                                value={editForm.sinoVietnamese} 
                                onChange={e => setEditForm({...editForm, sinoVietnamese: e.target.value})}
                                className="w-24 bg-theme-base-alt border border-theme-subtle text-sm text-theme-accent uppercase px-3 py-2 focus:outline-none focus:border-theme-accent"
                                placeholder="Hán Việt"
                              />
                            </div>
                            <input 
                              value={editForm.meaning} 
                              onChange={e => setEditForm({...editForm, meaning: e.target.value})}
                              className="w-full bg-theme-base-alt border border-theme-subtle text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                              placeholder="Ý nghĩa"
                            />
                            <textarea 
                              value={editForm.kanjiExplanation || ''} 
                              onChange={e => setEditForm({...editForm, kanjiExplanation: e.target.value})}
                              className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                              placeholder="Giải thích Hán tự"
                              rows={2}
                            />
                            
                            {(() => {
                              const isVerbs = editForm.wordType?.includes('Động từ');
                              const isAdjectivesOrNoun = editForm.wordType === 'Danh từ' || editForm.wordType === 'Tính từ i' || editForm.wordType === 'Tính từ na';
                              const isFormsEnabled = isVerbs || isAdjectivesOrNoun;
                              const formsLabel = isVerbs ? 'Các thể' : 'Các thì';
                              const formsNamePlaceholder = isVerbs ? 'Tên thể (ví dụ: Thể て)' : 'Tên thì (ví dụ: Quá khứ)';
                              const formsValuePlaceholder = isVerbs ? 'Sau khi chia (ví dụ: 教えて)' : 'Sau khi chia (ví dụ: だった)';

                              if (!isFormsEnabled) return null;

                              return (
                              <div className="pt-2 border-t border-theme-subtle mt-2">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-[10px] uppercase tracking-[0.1em] text-theme-accent opacity-80">{formsLabel}</label>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newForms = editForm.forms ? [...editForm.forms] : [];
                                      newForms.push({ id: crypto.randomUUID(), name: '', value: '' });
                                      setEditForm({...editForm, forms: newForms});
                                    }}
                                    className="p-1 rounded-sm bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors flex items-center gap-1 text-[10px]"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Thêm thể</span>
                                  </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {editForm.forms?.map((f, index) => (
                                    <div key={f.id || index} className="relative flex gap-2">
                                      <input 
                                        value={f.name} 
                                        onChange={e => {
                                          const newForms = [...(editForm.forms || [])];
                                          newForms[index] = { ...newForms[index], name: e.target.value };
                                          setEditForm({...editForm, forms: newForms});
                                        }}
                                        className="w-1/3 bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent"
                                        placeholder={formsNamePlaceholder}
                                      />
                                      <input 
                                        value={f.value} 
                                        onChange={e => {
                                          const newForms = [...(editForm.forms || [])];
                                          newForms[index] = { ...newForms[index], value: e.target.value };
                                          setEditForm({...editForm, forms: newForms});
                                        }}
                                        className="w-2/3 bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent pr-6"
                                        placeholder={formsValuePlaceholder}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newForms = [...(editForm.forms || [])];
                                          newForms.splice(index, 1);
                                          setEditForm({...editForm, forms: newForms});
                                        }}
                                        className="absolute top-1/2 -translate-y-1/2 right-1 p-1 text-theme-primary/40 hover:text-red-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              );
                            })()}
                            
                            <div className="pt-2 border-t border-theme-subtle mt-2">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] uppercase tracking-[0.1em] text-theme-accent opacity-80">Các ví dụ (Mở rộng)</label>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const newExamples = editForm.examples ? [...editForm.examples] : [];
                                    newExamples.unshift({ id: crypto.randomUUID(), sentence: '', translation: '' });
                                    setEditForm({...editForm, examples: newExamples});
                                  }}
                                  className="p-1 rounded-sm bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors flex items-center gap-1 text-[10px]"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Thêm</span>
                                </button>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                {(!editForm.examples || editForm.examples.length === 0) ? (
                                  <div className="flex flex-col gap-2 p-2 border border-theme-subtle bg-theme-base/50 rounded-sm">
                                    <input 
                                      value={editForm.example || ''} 
                                      onChange={e => setEditForm({...editForm, example: e.target.value})}
                                      className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                      placeholder="Ví dụ (Tiếng Nhật) - Cũ"
                                    />
                                    <input 
                                      value={editForm.exampleTranslation || ''} 
                                      onChange={e => setEditForm({...editForm, exampleTranslation: e.target.value})}
                                      className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                      placeholder="Dịch nghĩa (Tiếng Việt) - Cũ"
                                    />
                                  </div>
                                ) : (
                                  editForm.examples.map((ex, index) => (
                                    <div key={ex.id || index} className="relative p-2 border border-theme-subtle bg-theme-base/50 rounded-sm flex flex-col gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newExamples = [...(editForm.examples || [])];
                                          newExamples.splice(index, 1);
                                          setEditForm({...editForm, examples: newExamples});
                                        }}
                                        className="absolute top-1 right-1 p-1 text-theme-primary/40 hover:text-red-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                      
                                      <input 
                                        value={ex.sentence} 
                                        onChange={e => {
                                          const newExamples = [...(editForm.examples || [])];
                                          newExamples[index] = { ...newExamples[index], sentence: e.target.value };
                                          setEditForm({...editForm, examples: newExamples});
                                        }}
                                        className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent pr-6"
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
                                          className="w-full bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1 focus:outline-none focus:border-theme-accent italic"
                                          placeholder="Hiragana"
                                        />
                                        <input 
                                          value={ex.romaji || ''} 
                                          onChange={e => {
                                            const newExamples = [...(editForm.examples || [])];
                                            newExamples[index] = { ...newExamples[index], romaji: e.target.value };
                                            setEditForm({...editForm, examples: newExamples});
                                          }}
                                          className="w-full bg-theme-base-alt border border-theme-subtle text-[10px] text-theme-primary px-2 py-1 focus:outline-none focus:border-theme-accent italic"
                                          placeholder="Romaji"
                                        />
                                      </div>
                                      
                                      <input 
                                        value={ex.translation} 
                                        onChange={e => {
                                          const newExamples = [...(editForm.examples || [])];
                                          newExamples[index] = { ...newExamples[index], translation: e.target.value };
                                          setEditForm({...editForm, examples: newExamples});
                                        }}
                                        className="w-full bg-theme-base-alt border border-theme-subtle text-xs text-theme-primary px-2 py-1.5 focus:outline-none focus:border-theme-accent"
                                        placeholder="Dịch nghĩa (Tiếng Việt)"
                                      />
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-theme-primary opacity-50 text-xs italic font-serif align-middle">
                          Đang chỉnh sửa
                        </td>
                        <td className="px-4 py-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={saveEdit}
                              disabled={!editForm.kanji || !editForm.meaning}
                              className="p-2 bg-theme-accent text-theme-inverted hover:bg-theme-accent-light transition-colors inline-flex items-center justify-center rounded-sm disabled:opacity-50"
                              title="Lưu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="p-2 border border-theme-subtle text-theme-primary hover:bg-theme-active transition-colors inline-flex items-center justify-center rounded-sm"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={card.id} className="hover:bg-theme-hover transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-serif text-theme-primary">{card.kanji}</div>
                          <button
                            onClick={(e) => playAudio(e, card.kanji || card.reading)}
                            className="p-1.5 text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5 min-w-[200px] sm:min-w-[auto]">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="text-xs font-serif text-theme-primary italic opacity-60 tracking-wide break-all sm:break-normal">{card.reading || '---'}</div>
                          {card.romaji && (
                            <div className="text-xs font-serif text-theme-primary opacity-50 italic">{card.romaji}</div>
                          )}
                          {card.wordType && (
                            <span className="text-[10px] text-theme-muted bg-theme-hover px-1.5 py-0.5 rounded-sm border border-theme-subtle">{card.wordType}</span>
                          )}
                          {card.sinoVietnamese && (
                            <span className="text-[10px] text-theme-accent uppercase tracking-widest border border-theme-accent/30 px-1.5 py-0.5 rounded-sm">{card.sinoVietnamese}</span>
                          )}
                        </div>
                        <div className="text-sm tracking-widest uppercase text-theme-primary font-light break-words whitespace-normal max-w-[200px] sm:max-w-md">{card.meaning}</div>
                        {card.kanjiExplanation && (
                          <div className="mt-2 text-xs text-theme-primary font-sans opacity-80 whitespace-pre-wrap leading-relaxed max-w-[200px] sm:max-w-md">
                            {card.kanjiExplanation}
                          </div>
                        )}
                        
                        {/* Display multiple examples if present */}
                        {card.examples && card.examples.length > 0 ? (
                          <VocabCardExamples card={card} deck={deck} playAudio={playAudio} />
                        ) : (
                          /* Legacy single example fallback */
                          (card.example || card.exampleTranslation) && (
                            <div className="mt-2 space-y-1 border-t border-theme-subtle pt-2 max-w-[200px] sm:max-w-md group/ex">
                              {card.example && (
                                <div className="text-[11px] text-theme-primary opacity-70 flex items-start justify-between gap-2">
                                  <span className="truncate" title={card.example}>{renderExampleHighlight(card.example, card.kanji || card.reading, deck, card)}</span>
                                  <button
                                    onClick={(e) => playAudio(e, card.example!)}
                                    className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-0 group-hover/ex:opacity-100 shrink-0 -mt-0.5"
                                    title="Nghe câu ví dụ"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              {card.exampleTranslation && (
                                <div className="text-[11px] text-theme-accent opacity-70 truncate italic" title={card.exampleTranslation}>{card.exampleTranslation}</div>
                              )}
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1 bg-theme-active overflow-hidden border border-theme-base">
                              <div 
                                className="h-full bg-theme-accent" 
                                style={{ width: `${Math.min(100, (card.interval / 30) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-serif text-theme-accent opacity-80">{Number(card.interval) || 0} Ngày</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase">
                            <span className={isDue ? "text-red-500 font-medium" : "text-theme-primary opacity-50"}>
                              {isDue ? 'Cần Ôn Ngay' : `Sau ${Math.ceil((card.nextReviewDate - Date.now()) / (1000 * 60 * 60 * 24))} ngày`}
                            </span>
                            <span className="text-theme-inverted">|</span>
                            <span className="text-theme-primary opacity-40 italic font-serif">Độ khó: {(Number(card.easeFactor) || 2.5).toFixed(1)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <button 
                          onClick={() => startEdit(card)}
                          className="p-2 text-[#555] hover:text-theme-accent transition-colors inline-flex items-center justify-center opacity-70 hover:opacity-100 mr-1"
                          title="Sửa thẻ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onRemove(card.id)}
                          className="p-2 text-[#555] hover:text-red-500 transition-colors inline-flex items-center justify-center opacity-70 hover:opacity-100"
                          title="Xóa thẻ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
