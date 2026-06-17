import { KanjiCard } from '../types';
import { Trash2, Search } from 'lucide-react';
import { useState } from 'react';

interface VocabListProps {
  deck: KanjiCard[];
  onRemove: (id: string) => void;
}

export default function VocabList({ deck, onRemove }: VocabListProps) {
  const [search, setSearch] = useState('');

  const filteredDeck = deck.filter(c => 
    c.kanji.toLowerCase().includes(search.toLowerCase()) || 
    c.meaning.toLowerCase().includes(search.toLowerCase()) ||
    c.reading.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[#c5a059] mb-1 tracking-widest uppercase">Kho từ vựng</h2>
          <p className="text-[#d4d4d4] opacity-50 text-[10px] uppercase tracking-widest">Tổng cộng {deck.length} từ đã được thêm</p>
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
                  const isDue = card.nextReviewDate <= Date.now();
                  
                  return (
                    <tr key={card.id} className="hover:bg-[#1a1a1a] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="text-3xl font-serif text-white">{card.kanji}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs font-serif text-[#d4d4d4] italic opacity-60 mb-1 tracking-wide">{card.reading || '---'}</div>
                        <div className="text-sm tracking-widest uppercase text-white font-light">{card.meaning}</div>
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
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => onRemove(card.id)}
                          className="p-2 text-[#2a2a2a] hover:text-red-500 transition-colors inline-flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
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
