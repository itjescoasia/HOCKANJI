import { KanjiCard } from '../types';
import { BookOpen, Brain, Clock, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  deck: KanjiCard[];
  dueCards: KanjiCard[];
  onStartReview: () => void;
  onNavigateAdd: () => void;
}

export default function Dashboard({ deck, dueCards, onStartReview, onNavigateAdd }: DashboardProps) {
  const isDue = dueCards.length > 0;

  // Chart 1: Progress Data
  const learnedCards = deck.filter(c => c.interval > 0).length;
  const newCards = deck.length - learnedCards;
  const progressData = [
    { name: 'Đã thuộc', value: learnedCards, color: '#c5a059' },
    { name: 'Mới / Sắp quên', value: newCards, color: '#2a2a2a' }
  ];

  // Chart 2: 7-Day Forecast Data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const forecastData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const count = deck.filter(c => {
      if (i === 0) {
        return c.nextReviewDate < nextDate.getTime();
      } else {
        return c.nextReviewDate >= date.getTime() && c.nextReviewDate < nextDate.getTime();
      }
    }).length;

    return {
      date: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      count,
      name: 'Số từ'
    };
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full flex flex-col gap-6">
      <div className="mb-2 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-serif text-[#c5a059] tracking-widest mb-3 uppercase" style={{ fontFamily: 'serif' }}>Thống Kê Học Tập</h1>
        <p className="text-[11px] text-[#d4d4d4] opacity-50 uppercase tracking-[0.2em]">Đánh giá hiệu quả và tiến độ ghi nhớ</p>
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
              Hệ thống sử dụng thuật toán lặp lại ngắt quãng để tối ưu hóa việc phân bổ lịch ôn tập.
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {deck.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
            <h3 className="text-[11px] font-sans text-[#d4d4d4] opacity-60 tracking-widest uppercase mb-8">Mức độ ghi nhớ</h3>
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: '4px' }}
                    itemStyle={{ color: '#d4d4d4', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {progressData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-[#d4d4d4] opacity-70 tracking-widest uppercase">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
            <h3 className="text-[11px] font-sans text-[#d4d4d4] opacity-60 tracking-widest uppercase mb-6">Dự báo ôn tập (7 ngày)</h3>
            <div className="h-48 flex-1 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#1a1a1a'}}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: '4px' }}
                    itemStyle={{ color: '#c5a059', fontSize: '12px' }}
                    labelStyle={{ color: '#d4d4d4', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar dataKey="count" name="Số từ" fill="#c5a059" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-8 sm:p-14 text-center relative overflow-hidden mt-2">
        <h2 className="text-2xl sm:text-3xl font-serif mb-4 relative z-10 text-[#c5a059] tracking-widest uppercase">
          {isDue ? `Cần thực hiện: Ôn ${dueCards.length} từ` : "Tuyệt vời, chưa có từ nào cần ôn"}
        </h2>
        
        <p className="opacity-60 mb-10 max-w-xl mx-auto relative z-10 text-[13px] leading-relaxed tracking-wide">
          {isDue 
            ? "Danh sách ôn tập hằng ngày gồm các từ đã quên và đến hạn. Hãy đánh giá độ nhớ để AI tính chu kỳ."
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
