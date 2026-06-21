import { KanjiCard } from '../types';
import { Trash2, Search, Upload, Download, Edit2, Check, X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface VocabListProps {
  deck: KanjiCard[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Pick<KanjiCard, 'kanji' | 'reading' | 'meaning' | 'sinoVietnamese' | 'example' | 'exampleTranslation' | 'wordType'>>) => void;
  onImport: (cards: { kanji: string; reading: string; meaning: string; sinoVietnamese?: string; example?: string; exampleTranslation?: string; wordType?: string }[]) => Promise<{added: number, updated: number}>;
}

export default function VocabList({ deck, onRemove, onUpdate, onImport }: VocabListProps) {
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Pick<KanjiCard, 'kanji' | 'reading' | 'meaning' | 'sinoVietnamese' | 'example' | 'exampleTranslation' | 'wordType'>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (card: KanjiCard) => {
    setEditingId(card.id);
    setEditForm({
      kanji: card.kanji,
      reading: card.reading || '',
      sinoVietnamese: card.sinoVietnamese || '',
      meaning: card.meaning,
      example: card.example || '',
      exampleTranslation: card.exampleTranslation || '',
      wordType: card.wordType || '',
    });
  };

  const saveEdit = () => {
    if (editingId && editForm.kanji && editForm.meaning && onUpdate) {
      onUpdate(editingId, {
        kanji: editForm.kanji.trim(),
        reading: editForm.reading?.trim() || '',
        sinoVietnamese: editForm.sinoVietnamese?.trim() || '',
        meaning: editForm.meaning.trim(),
        example: editForm.example?.trim() || '',
        exampleTranslation: editForm.exampleTranslation?.trim() || '',
        wordType: editForm.wordType?.trim() || ''
      });
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredDeck = deck.filter(c => 
    c.kanji.toLowerCase().includes(search.toLowerCase()) || 
    c.meaning.toLowerCase().includes(search.toLowerCase()) ||
    c.reading.toLowerCase().includes(search.toLowerCase())
  );

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
          <h2 className="text-2xl font-serif text-[#c5a059] mb-2 tracking-widest uppercase">Kho từ vựng</h2>
          <div className="flex items-center gap-4">
            <span className="text-[#d4d4d4] opacity-50 text-[10px] uppercase tracking-widest">Tổng cộng {deck.length} từ đã được thêm</span>
            <div className="h-4 w-px bg-[#2a2a2a]"></div>
            <button
              onClick={handleExport}
              className="text-[10px] uppercase tracking-widest text-[#d4d4d4] opacity-50 hover:opacity-100 hover:text-[#c5a059] transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Xuất Excel
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="text-[10px] uppercase tracking-widest text-[#d4d4d4] opacity-50 hover:opacity-100 hover:text-[#c5a059] transition-colors flex items-center gap-1"
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
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#c5a059] opacity-50" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm Kanji, nghĩa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-2 bg-[#0c0c0c] border border-[#2a2a2a] text-[#d4d4d4] w-full sm:w-72 focus:outline-none focus:border-[#c5a059] transition-colors rounded-none placeholder:opacity-30 text-sm"
          />
        </div>
      </div>
      
      {deck.length === 0 ? (
        <div className="bg-[#121212] border border-[#2a2a2a] p-16 text-center shadow-lg">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-[#c5a059] opacity-50" />
          </div>
          <p className="text-lg font-serif text-[#c5a059] tracking-widest uppercase mb-2">Chưa có từ vựng nào</p>
          <p className="text-[#d4d4d4] opacity-50 max-w-md mx-auto text-sm leading-relaxed tracking-wide">Hãy thêm từ vựng mới để bắt đầu quá trình học ứng dụng Spaced Repetition nhé.</p>
        </div>
      ) : filteredDeck.length === 0 ? (
        <div className="bg-[#121212] border border-[#2a2a2a] p-16 text-center">
          <p className="text-[#d4d4d4] opacity-50 text-sm tracking-wide">Không tìm thấy kết quả phù hợp với "{search}"</p>
        </div>
      ) : (
        <div className="bg-[#121212] border border-[#2a2a2a] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
                  <th className="px-8 py-4 text-[10px] text-[#c5a059] opacity-70 uppercase tracking-widest font-normal">Kanji</th>
                  <th className="px-8 py-4 text-[10px] text-[#c5a059] opacity-70 uppercase tracking-widest font-normal">Cách đọc / Nghĩa</th>
                  <th className="px-8 py-4 text-[10px] text-[#c5a059] opacity-70 uppercase tracking-widest font-normal">Tiến trình (SRS)</th>
                  <th className="px-8 py-4 text-[10px] text-[#c5a059] opacity-70 uppercase tracking-widest font-normal text-right">Quản lý</th>
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
                      <tr key={card.id} className="bg-[#1a1a1a] shadow-inner">
                        <td className="px-4 py-4 w-32 align-top">
                          <input 
                            value={editForm.kanji} 
                            onChange={e => setEditForm({...editForm, kanji: e.target.value})}
                            className="w-full bg-[#0c0c0c] border border-[#2a2a2a] text-xl font-serif text-white px-3 py-2 focus:outline-none focus:border-[#c5a059]"
                            placeholder="Kanji"
                          />
                        </td>
                        <td className="px-4 py-4 min-w-[250px] align-top">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <input 
                                value={editForm.reading} 
                                onChange={e => setEditForm({...editForm, reading: e.target.value})}
                                className="flex-1 bg-[#0c0c0c] border border-[#2a2a2a] text-sm text-[#d4d4d4] px-3 py-2 focus:outline-none focus:border-[#c5a059]"
                                placeholder="Cách đọc"
                              />
                              <select 
                                value={editForm.wordType} 
                                onChange={e => setEditForm({...editForm, wordType: e.target.value})}
                                className="w-32 bg-[#0c0c0c] border border-[#2a2a2a] text-sm text-[#d4d4d4] px-3 py-2 focus:outline-none focus:border-[#c5a059] appearance-none"
                              >
                                <option value="">Loại từ</option>
                                <option value="Động từ nhóm I">Động từ nhóm I</option>
                                <option value="Động từ nhóm II">Động từ nhóm II</option>
                                <option value="Động từ nhóm III">Động từ nhóm III</option>
                                <option value="Danh từ">Danh từ</option>
                                <option value="Tính từ i">Tính từ i</option>
                                <option value="Tính từ na">Tính từ na</option>
                                <option value="Khác">Khác</option>
                              </select>
                              <input 
                                value={editForm.sinoVietnamese} 
                                onChange={e => setEditForm({...editForm, sinoVietnamese: e.target.value})}
                                className="w-24 bg-[#0c0c0c] border border-[#2a2a2a] text-sm text-[#c5a059] uppercase px-3 py-2 focus:outline-none focus:border-[#c5a059]"
                                placeholder="Hán Việt"
                              />
                            </div>
                            <input 
                              value={editForm.meaning} 
                              onChange={e => setEditForm({...editForm, meaning: e.target.value})}
                              className="w-full bg-[#0c0c0c] border border-[#2a2a2a] text-sm text-white px-3 py-2 focus:outline-none focus:border-[#c5a059]"
                              placeholder="Ý nghĩa"
                            />
                            <input 
                              value={editForm.example} 
                              onChange={e => setEditForm({...editForm, example: e.target.value})}
                              className="w-full bg-[#0c0c0c] border border-[#2a2a2a] text-xs text-[#d4d4d4] px-3 py-2 focus:outline-none focus:border-[#c5a059]"
                              placeholder="Ví dụ (Tiếng Nhật)"
                            />
                            <input 
                              value={editForm.exampleTranslation} 
                              onChange={e => setEditForm({...editForm, exampleTranslation: e.target.value})}
                              className="w-full bg-[#0c0c0c] border border-[#2a2a2a] text-xs text-[#d4d4d4] px-3 py-2 focus:outline-none focus:border-[#c5a059]"
                              placeholder="Dịch nghĩa (Tiếng Việt)"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-[#d4d4d4] opacity-50 text-xs italic font-serif align-middle">
                          Đang chỉnh sửa
                        </td>
                        <td className="px-4 py-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={saveEdit}
                              disabled={!editForm.kanji || !editForm.meaning}
                              className="p-2 bg-[#c5a059] text-black hover:bg-[#d6b16a] transition-colors inline-flex items-center justify-center rounded-sm disabled:opacity-50"
                              title="Lưu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="p-2 border border-[#2a2a2a] text-[#d4d4d4] hover:bg-[#2a2a2a] transition-colors inline-flex items-center justify-center rounded-sm"
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
                    <tr key={card.id} className="hover:bg-[#1a1a1a] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="text-3xl font-serif text-white">{card.kanji}</div>
                      </td>
                      <td className="px-8 py-5 min-w-[200px] sm:min-w-[auto]">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-xs font-serif text-[#d4d4d4] italic opacity-60 tracking-wide break-all sm:break-normal">{card.reading || '---'}</div>
                          {card.wordType && (
                            <span className="text-[10px] text-[#4a4a4a] bg-[#1a1a1a] px-1.5 py-0.5 rounded-sm border border-[#2a2a2a]">{card.wordType}</span>
                          )}
                          {card.sinoVietnamese && (
                            <span className="text-[10px] text-[#c5a059] uppercase tracking-widest border border-[#c5a059]/30 px-1.5 py-0.5 rounded-sm">{card.sinoVietnamese}</span>
                          )}
                        </div>
                        <div className="text-sm tracking-widest uppercase text-white font-light break-words whitespace-normal max-w-[200px] sm:max-w-md">{card.meaning}</div>
                        {(card.example || card.exampleTranslation) && (
                          <div className="mt-2 space-y-1 border-t border-[#2a2a2a] pt-2 max-w-[200px] sm:max-w-md">
                            {card.example && (
                              <div className="text-[11px] text-[#d4d4d4] opacity-70 truncate" title={card.example}>{card.example}</div>
                            )}
                            {card.exampleTranslation && (
                              <div className="text-[11px] text-[#c5a059] opacity-70 truncate italic" title={card.exampleTranslation}>{card.exampleTranslation}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1 bg-[#2a2a2a] overflow-hidden border border-[#0a0a0a]">
                              <div 
                                className="h-full bg-[#c5a059]" 
                                style={{ width: `${Math.min(100, (card.interval / 30) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-serif text-[#c5a059] opacity-80">{card.interval} Ngày</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase">
                            <span className={isDue ? "text-red-500 font-medium" : "text-[#d4d4d4] opacity-50"}>
                              {isDue ? 'Cần Ôn Ngay' : `Sau ${Math.ceil((card.nextReviewDate - Date.now()) / (1000 * 60 * 60 * 24))} ngày`}
                            </span>
                            <span className="text-[#2a2a2a]">|</span>
                            <span className="text-[#d4d4d4] opacity-40 italic font-serif">Độ khó: {card.easeFactor.toFixed(1)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <button 
                          onClick={() => startEdit(card)}
                          className="p-2 text-[#555] hover:text-[#c5a059] transition-colors inline-flex items-center justify-center opacity-70 hover:opacity-100 mr-1"
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
