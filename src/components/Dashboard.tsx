import { KanjiCard } from '../types';
import { BookOpen, Brain, Clock, Zap } from 'lucide-react';

interface DashboardProps {
  deck: KanjiCard[];
  dueCards: KanjiCard[];
  onStartReview: () => void;
  onNavigateAdd: () => void;
}

export default function Dashboard({ deck, dueCards, onStartReview, onNavigateAdd }: DashboardProps) {
  const isDue = dueCards.length > 0;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full flex flex-col gap-8">
      <div className="mb-4 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-serif text-[#c5a059] tracking-widest mb-3 uppercase" style={{ fontFamily: 'serif' }}>Thống Kê Học Tập</h1>
        <p className="text-sm text-[#d4d4d4] opacity-50 uppercase tracking-[0.2em]">Tối ưu ghi nhớ bằng thuật toán AI ngắt quãng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <BookOpen className="w-6 h-6 text-[#c5a059] mb-4 opacity-70" />
          <span className="text-4xl font-serif text-white mb-2" style={{ fontFamily: 'serif' }}>{deck.length}</span>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059] opacity-70">Tổng Số Thẻ Từ</span>
        </div>
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <Clock className="w-6 h-6 text-red-500 mb-4 opacity-70" />
          <span className="text-4xl font-serif text-white mb-2" style={{ fontFamily: 'serif' }}>{dueCards.length}</span>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059] opacity-70">Cần Ôn Hôm Nay</span>
        </div>
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col sm:col-span-2 justify-between">
          <div className="flex justify-between items-start mb-4 opacity-70 text-[#c5a059]">
            <Brain className="w-6 h-6" />
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-serif text-[#c5a059] block mb-2 tracking-widest uppercase">Thuật toán SM-2</span>
            <span className="text-xs text-[#d4d4d4] opacity-60 leading-relaxed block tracking-wide">
              Hệ thống sử dụng các thuật toán lặp lại ngắt quãng Ebbinghaus tối ưu cho việc nhận diện chữ Hán. Giúp làm chủ Kanji hiệu quả.
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-8 sm:p-14 text-center relative overflow-hidden">
        
        <h2 className="text-2xl sm:text-3xl font-serif mb-4 relative z-10 text-[#c5a059] tracking-widest uppercase">
          {isDue ? `Cần thực hiện: Ôn ${dueCards.length} từ` : "Tuyệt vời, chưa có từ nào cần ôn"}
        </h2>
        
        <p className="opacity-60 mb-10 max-w-xl mx-auto relative z-10 text-sm leading-relaxed tracking-wide">
          {isDue 
            ? "Danh sách ôn tập hằng ngày gồm các từ đã quên và đến hạn. Hãy đánh giá mức độ nhớ của bạn một cách trung thực nhất để AI tính toán chu kỳ phù hợp."
            : deck.length === 0 
                ? "Kho từ vựng trống. Hãy bắt đầu xây dựng bộ thẻ của riêng bạn để học."
                : "Bạn đã hoàn thành mục tiêu hôm nay. Hãy quay lại vào ngày mai hoặc thu thập thêm từ vựng mới nhé."}
        </p>

        {isDue ? (
          <button 
            onClick={onStartReview}
            className="border border-[#c5a059] text-[#c5a059] bg-[#121212] hover:bg-[#c5a059] hover:text-black font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px] relative z-10"
          >
             Bắt đầu phiên ôn tập
          </button>
        ) : (
          <button 
            onClick={onNavigateAdd}
            className="border border-[#2a2a2a] text-[#d4d4d4] bg-[#121212] hover:border-[#c5a059] hover:text-[#c5a059] font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px] relative z-10"
          >
             Thêm Kanji mới
          </button>
        )}
      </div>
    </div>
  );
}
