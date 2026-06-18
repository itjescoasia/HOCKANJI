import { KanjiCard } from '../types';
import { BookOpen, Brain, Clock, Zap, Target } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  deck: KanjiCard[];
  dueCards: KanjiCard[];
  onStartReview: () => void;
  onNavigateAdd: () => void;
}

export default function Dashboard({ deck, dueCards, onStartReview, onNavigateAdd }: DashboardProps) {
  const isDue = dueCards.length > 0;

  // Cấp độ ghi nhớ
  const matureCards = deck.filter(c => c.interval >= 21).length;
  const learningCards = deck.filter(c => c.interval > 0 && c.interval < 21).length;
  const newCards = deck.filter(c => c.interval === 0).length;
  
  const totalCards = deck.length;
  const masteryRate = totalCards > 0 ? Math.round(((matureCards + learningCards) / totalCards) * 100) : 0;

  // Chart 1: Progress Data
  const progressData = [
    { name: 'Đã khắc sâu', value: matureCards, color: '#c5a059' },
    { name: 'Đang học', value: learningCards, color: '#4a4a4a' },
    { name: 'Mới học / Quên', value: newCards, color: '#1a1a1a' }
  ].filter(item => item.value > 0 || totalCards === 0);

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
        <p className="text-[11px] text-[#d4d4d4] opacity-50 uppercase tracking-[0.2em]">Tiến độ học và biểu diễn dữ liệu</p>
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
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <Brain className="w-6 h-6 text-[#c5a059] mb-4 opacity-70" />
          <span className="text-4xl font-serif text-white mb-2" style={{ fontFamily: 'serif' }}>{matureCards}</span>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059] opacity-70">Từ Đã Khắc Sâu (&gt;21 ngày)</span>
        </div>
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <Target className="w-6 h-6 text-[#c5a059] mb-4 opacity-70" />
          <span className="text-4xl font-serif text-white mb-2" style={{ fontFamily: 'serif' }}>{masteryRate}%</span>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059] opacity-70">Tiến độ (Đang + Đã học)</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <h3 className="text-[11px] font-sans text-[#d4d4d4] opacity-60 tracking-widest uppercase mb-8">Mức độ ghi nhớ</h3>
          <div className="h-[250px] w-full flex-1 relative">
            {deck.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
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
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 uppercase tracking-widest">Chưa có dữ liệu</div>
            )}
          </div>
          {deck.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {progressData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-[#d4d4d4] opacity-70 tracking-widest uppercase">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <h3 className="text-[11px] font-sans text-[#d4d4d4] opacity-60 tracking-widest uppercase mb-6">Lịch trình ôn tập (7 ngày tới)</h3>
          <div className="h-[250px] w-full flex-1 mt-6 relative">
            {deck.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 uppercase tracking-widest">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-8 sm:p-14 text-center relative overflow-hidden mt-2">
        <h2 className="text-2xl sm:text-3xl font-serif mb-4 relative z-10 text-[#c5a059] tracking-widest uppercase">
          {isDue ? `Cần thực hiện: Ôn ${dueCards.length} từ` : "Tuyệt vời, chưa có từ nào cần ôn"}
        </h2>
        
        <p className="opacity-60 mb-10 max-w-xl mx-auto relative z-10 text-[13px] leading-relaxed tracking-wide">
          {isDue 
            ? "Danh sách ôn tập hằng ngày gồm các từ đã quên và đến hạn. Thẻ từ sẽ lặp lại liên tục ngắt quãng cho đến khi bạn khắc sâu."
            : deck.length === 0 
                ? "Kho từ vựng trống. Hãy bắt đầu thêm các chữ mới vào từ điển của bạn."
                : "Bạn đã hoàn thành mục tiêu hôm nay. Hãy quay lại vào ngày mai hoặc thu thập thêm từ vựng mới."}
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
             Thêm từ vựng mới
          </button>
        )}
      </div>
    </div>
  );
}
