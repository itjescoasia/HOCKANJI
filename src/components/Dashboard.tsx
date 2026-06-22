import { useState, useMemo, useEffect } from 'react';
import { KanjiCard } from '../types';
import { UserStats } from '../hooks/useStudyStats';
import { getLocalDateString, getVietnamDate } from '../lib/dateUtils';
import { BookOpen, Brain, Clock, Zap, Target, TrendingUp, TrendingDown, RefreshCw, Search, X } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  deck: KanjiCard[];
  dueCards: KanjiCard[];
  leftoverNewCards?: number;
  stats?: UserStats;
  onStartReview: () => void;
  onStartFreeStudy?: () => void;
  onStartDifficultReview?: () => void;
  onNavigateAdd: () => void;
  onRecordWordOfTheDay?: (id: string) => void;
}

export default function Dashboard({ deck, dueCards, leftoverNewCards = 0, stats = {}, onStartReview, onStartFreeStudy, onStartDifficultReview, onNavigateAdd, onRecordWordOfTheDay }: DashboardProps) {
  const [isChangingWotd, setIsChangingWotd] = useState(false);
  const [wotdSearch, setWotdSearch] = useState('');

  const isDue = dueCards.length > 0;

  // Cấp độ ghi nhớ
  const matureCards = deck.filter(c => c.interval >= 21).length;
  const learningCards = deck.filter(c => c.interval > 0 && c.interval < 21).length;
  const newCards = deck.filter(c => c.interval === 0).length;
  
  const totalCards = deck.length;
  
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

  // Calculate Progress Stats
  const todayStr = getLocalDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  const todayStats = stats[todayStr] || { reviewed: 0, correct: 0, mastered: 0, newLearned: 0 };
  const yesterdayStats = stats[yesterdayStr] || { reviewed: 0, correct: 0, mastered: 0, newLearned: 0 };

  // Tiến độ ôn tập hôm nay
  const studiedToday = todayStats.reviewed || 0;
  const todayGoal = studiedToday + dueCards.length;
  const todayProgressRate = todayGoal > 0 ? Math.round((studiedToday / todayGoal) * 100) : 100;

  const reviewedDiff = todayStats.reviewed - yesterdayStats.reviewed;
  const correctRateToday = todayStats.reviewed > 0 ? Math.round((todayStats.correct / todayStats.reviewed) * 100) : 0;
  const correctRateYesterday = yesterdayStats.reviewed > 0 ? Math.round((yesterdayStats.correct / yesterdayStats.reviewed) * 100) : 0;
  const errorRateDiff = (100 - correctRateToday) - (100 - correctRateYesterday); // negative means fewer errors today

  const studyHistoryData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = getLocalDateString(d);
    const s = stats[dStr] || { reviewed: 0, correct: 0, mastered: 0, freeStudyTime: 0, remembered: 0 };
    return {
      date: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      reviewed: s.reviewed,
      correct: s.correct,
      remembered: s.remembered || 0,
      freeStudyTimeMinutes: Math.ceil((s.freeStudyTime || 0) / 60)
    };
  });

  // Calculate Word of the Day
  const todayForSeed = getVietnamDate();
  const seed = todayForSeed.getFullYear() * 10000 + (todayForSeed.getMonth() + 1) * 100 + todayForSeed.getDate();
  
  const wordOfTheDay = useMemo(() => {
    const syncedWotdId = stats[todayStr]?.wotdId;

    if (syncedWotdId) {
      const cachedWord = deck.find(c => c.id === syncedWotdId);
      if (cachedWord) {
        return cachedWord;
      }
    }
    
    const difficultWords = [...deck]
      .filter(c => (c.difficultScore || 0) < 0)
      .sort((a, b) => (a.difficultScore || 0) - (b.difficultScore || 0))
      .slice(0, 30);

    let newWord = null;
    if (difficultWords.length > 0) {
      newWord = difficultWords[seed % difficultWords.length];
    } else if (deck.length > 0) {
      // Fallback to random word if there are no difficult words yet
      newWord = deck[seed % deck.length];
    }
    
    return newWord;
  }, [deck, seed, stats, todayStr]);

  // Sync back to stats if WOTD changes and we have a function
  useEffect(() => {
    if (wordOfTheDay && onRecordWordOfTheDay && !stats[todayStr]?.wotdId) {
      onRecordWordOfTheDay(wordOfTheDay.id);
    }
  }, [wordOfTheDay, onRecordWordOfTheDay, stats, todayStr]);

  const filteredWotdList = useMemo(() => {
    if (!wotdSearch.trim()) return deck.slice(0, 5); // Default show some words
    const lowerSearch = wotdSearch.toLowerCase();
    return deck.filter(c => 
      c.kanji.toLowerCase().includes(lowerSearch) ||
      c.reading.toLowerCase().includes(lowerSearch) ||
      c.meaning.toLowerCase().includes(lowerSearch)
    ).slice(0, 10);
  }, [deck, wotdSearch]);

  const handleSelectNewWotd = (id: string) => {
    if (onRecordWordOfTheDay) {
      onRecordWordOfTheDay(id);
    }
    setIsChangingWotd(false);
    setWotdSearch('');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full flex flex-col gap-6">
      <div className="mb-2 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-serif text-[#c5a059] tracking-widest mb-3 uppercase" style={{ fontFamily: 'serif' }}>Thống Kê Học Tập</h1>
        <p className="text-[11px] text-[#d4d4d4] opacity-50 uppercase tracking-[0.2em]">Tiến độ học và biểu diễn dữ liệu</p>
      </div>

      {/* Word of the Day */}
      {wordOfTheDay && (
        <div className="bg-[#121212] border border-[#c5a059] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none hidden sm:block">
            <span className="text-8xl font-serif whitespace-nowrap max-w-full overflow-hidden text-ellipsis block">{wordOfTheDay.kanji}</span>
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[10px] uppercase tracking-widest text-[#c5a059] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full inline-block"></span>
                  Từ vựng mỗi ngày
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
                  <span className="text-4xl sm:text-5xl font-serif text-white">{wordOfTheDay.kanji}</span>
                  {wordOfTheDay.reading && (
                    <span className="text-lg text-[#d4d4d4] opacity-80">{wordOfTheDay.reading}</span>
                  )}
                  {wordOfTheDay.wordType && (
                    <span className="text-[10px] uppercase border border-[#c5a059]/40 text-[#c5a059] px-2 py-0.5 rounded opacity-80 self-start sm:self-auto mt-2 sm:mt-0">{wordOfTheDay.wordType}</span>
                  )}
                </div>
                <p className="text-sm text-[#d4d4d4] opacity-90 max-w-2xl mt-2">{wordOfTheDay.meaning}</p>
                {wordOfTheDay.example && (
                  <div className="mt-4 border-t border-[#2a2a2a] pt-3">
                    <p className="text-xs text-[#d4d4d4] italic opacity-80">"{wordOfTheDay.example}"</p>
                    {wordOfTheDay.exampleTranslation && (
                      <p className="text-[11px] text-[#d4d4d4] opacity-50 mt-1 uppercase tracking-wider">{wordOfTheDay.exampleTranslation}</p>
                    )}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsChangingWotd(!isChangingWotd)}
                className="text-[#d4d4d4] opacity-50 hover:opacity-100 hover:text-[#c5a059] transition-colors p-2"
                title="Thay đổi từ vựng mỗi ngày"
              >
                {isChangingWotd ? <X className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
              </button>
            </div>

            {isChangingWotd && (
              <div className="mt-4 border-t border-[#2a2a2a] pt-4 animate-in fade-in slide-in-from-top-2">
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#d4d4d4]/50" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm từ vựng..." 
                    value={wotdSearch}
                    onChange={e => setWotdSearch(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded text-sm text-white px-9 py-2 focus:outline-none focus:border-[#c5a059]/50 transition-colors placeholder:text-[#d4d4d4]/30"
                  />
                </div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a2a transparent' }}>
                  {filteredWotdList.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleSelectNewWotd(card.id)}
                      className={`text-left px-4 py-3 rounded border transition-all ${card.id === wordOfTheDay.id ? 'bg-[#c5a059]/10 border-[#c5a059]' : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#c5a059]/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-serif text-white">{card.kanji}</span>
                        {card.reading && <span className="text-sm text-[#d4d4d4] opacity-70">{card.reading}</span>}
                        {card.id === wordOfTheDay.id && <span className="text-[10px] text-[#c5a059] ml-auto">Đang chọn</span>}
                      </div>
                      <p className="text-xs text-[#d4d4d4] opacity-60 mt-1 line-clamp-1">{card.meaning}</p>
                    </button>
                  ))}
                  {filteredWotdList.length === 0 && (
                    <div className="text-center text-sm text-[#d4d4d4]/50 py-4">Không tìm thấy từ vựng</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Indicators (Chỉ số tiến bộ) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121212] p-5 border border-[#2a2a2a] flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d4d4d4] opacity-60">Số từ ôn hôm nay</span>
            <Zap className="w-4 h-4 text-[#c5a059] opacity-70" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-3xl font-serif text-white">{todayStats.reviewed}</span>
            {reviewedDiff !== 0 && (
              <span className={`flex items-center text-[11px] uppercase tracking-widest ${reviewedDiff > 0 ? 'text-green-500' : 'text-red-500'} mb-1`}>
                {reviewedDiff > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(reviewedDiff)} so với h.qua
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#121212] p-5 border border-[#2a2a2a] flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d4d4d4] opacity-60">Thẻ nhớ đúng hôm nay</span>
            <Target className="w-4 h-4 text-green-500 opacity-70" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-3xl font-serif text-white">{todayStats.correct}</span>
            <span className="text-[11px] text-[#d4d4d4] opacity-40 uppercase tracking-widest mb-1">
              / {todayStats.reviewed}
            </span>
          </div>
        </div>

        <div className="bg-[#121212] p-5 border border-[#2a2a2a] flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d4d4d4] opacity-60">Tỷ lệ trả lời sai</span>
            <Brain className="w-4 h-4 text-red-500 opacity-70" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-3xl font-serif text-white">{todayStats.reviewed > 0 ? 100 - correctRateToday : 0}%</span>
            {errorRateDiff !== 0 && todayStats.reviewed > 0 && yesterdayStats.reviewed > 0 && (
              <span className={`flex items-center text-[11px] uppercase tracking-widest ${errorRateDiff < 0 ? 'text-green-500' : 'text-red-500'} mb-1`}>
                {errorRateDiff < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                {Math.abs(errorRateDiff)}% so với h.qua
              </span>
            )}
            {errorRateDiff === 0 && todayStats.reviewed > 0 && (
               <span className="text-[11px] text-[#d4d4d4] opacity-40 uppercase tracking-widest mb-1">Không đổi</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col relative overflow-hidden">
          <BookOpen className="w-6 h-6 text-[#c5a059] mb-4 opacity-70" />
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif text-white">{deck.length}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059] opacity-70">Tổng Số Thẻ Từ</span>
        </div>
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <Clock className="w-6 h-6 text-red-500 mb-4 opacity-70" />
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif text-white">{dueCards.length}</span>
            <span className="text-[11px] text-[#d4d4d4] opacity-40 uppercase tracking-widest mb-1">/ 150</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-red-400 opacity-70">Cần Ôn Tập</span>
        </div>
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <Zap className="w-6 h-6 text-blue-500 mb-4 opacity-70" />
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif text-white">{todayStats.newLearned || 0}</span>
            <span className="text-[11px] text-[#d4d4d4] opacity-40 uppercase tracking-widest mb-1">/ 15</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-blue-400 opacity-70">Thẻ Mới Đã Học</span>
        </div>
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <Brain className="w-6 h-6 text-[#c5a059] mb-4 opacity-70" />
          <span className="text-4xl font-serif text-white mb-2" style={{ fontFamily: 'serif' }}>{matureCards}</span>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059] opacity-70">Từ Đã Khắc Sâu (&gt;21 ngày)</span>
        </div>
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <Target className="w-6 h-6 text-[#c5a059] mb-4 opacity-70" />
          <span className="text-4xl font-serif text-white mb-2" style={{ fontFamily: 'serif' }}>{todayProgressRate}%</span>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059] opacity-70">Tiến độ hôm nay</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <h3 className="text-[11px] font-sans text-[#d4d4d4] opacity-60 tracking-widest uppercase mb-8">Lịch sử ôn tập (7 ngày qua)</h3>
          <div className="h-[250px] w-full flex-1 relative">
             <ResponsiveContainer width="100%" height={250}>
                <LineChart data={studyHistoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#1a1a1a'}}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: '4px' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ color: '#d4d4d4', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="reviewed" name="Đã ôn" stroke="#4a4a4a" strokeWidth={2} dot={{ fill: '#4a4a4a', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="correct" name="Nhớ đúng (Bao gồm Mơ hồ)" stroke="#c5a059" strokeWidth={2} dot={{ fill: '#c5a059', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="remembered" name="Đã nhớ" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
          </div>
        </div>

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
                  <RechartsTooltip 
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
      </div>

      {/* Forecast & Free Study Time Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <h3 className="text-[11px] font-sans text-[#d4d4d4] opacity-60 tracking-widest uppercase mb-6">Lịch trình ôn tập (7 ngày tới)</h3>
          <div className="h-[250px] w-full flex-1 mt-6 relative">
            {deck.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={forecastData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
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

        <div className="bg-[#121212] p-6 border border-[#2a2a2a] flex flex-col">
          <h3 className="text-[11px] font-sans text-[#d4d4d4] opacity-60 tracking-widest uppercase mb-6">Thời gian học nhồi (7 ngày qua)</h3>
          <div className="h-[250px] w-full flex-1 mt-6 relative">
            {studyHistoryData.some(d => d.freeStudyTimeMinutes > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={studyHistoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#2a2a2a" tick={{fill: '#d4d4d4', opacity: 0.5, fontSize: 10}} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#1a1a1a'}}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: '4px' }}
                    itemStyle={{ color: '#4a90e2', fontSize: '12px' }}
                    labelStyle={{ color: '#d4d4d4', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar dataKey="freeStudyTimeMinutes" name="Phút" fill="#4a90e2" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 uppercase tracking-widest text-[#d4d4d4] text-center px-4">
                 Bạn chưa học nhồi trong 7 ngày qua.
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-8 sm:p-14 text-center relative overflow-hidden mt-2">
        <h2 className="text-2xl sm:text-3xl font-serif mb-4 relative z-10 text-[#c5a059] tracking-widest uppercase">
          {isDue ? `Cần thực hiện: Ôn ${dueCards.length} từ` : "Tuyệt vời, chưa có từ nào cần ôn"}
        </h2>
        
        <p className="opacity-60 mb-8 max-w-xl mx-auto relative z-10 text-[13px] leading-relaxed tracking-wide">
          {isDue 
            ? "Danh sách ôn tập hằng ngày gồm các từ đã quên và đến hạn. Thẻ từ sẽ lặp lại liên tục ngắt quãng cho đến khi bạn khắc sâu."
            : deck.length === 0 
                ? "Kho từ vựng trống. Hãy bắt đầu thêm các chữ mới vào từ điển của bạn."
                : "Bạn đã hoàn thành mục tiêu hôm nay. Hãy quay lại vào ngày mai hoặc thu thập thêm từ vựng mới."}
        </p>

        {!isDue && leftoverNewCards > 0 && (
          <div className="mb-10 w-full flex justify-center">
             <div className="bg-[#1a1a1a] border border-[#2a2a2a] inline-flex items-center gap-2 px-4 py-2 opacity-80">
               <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
               <span className="text-xs uppercase tracking-widest text-[#d4d4d4]">Hiện đang còn <strong className="text-[#c5a059]">{leftoverNewCards} từ mới</strong> chờ bạn khám phá vào ngày mai!</span>
             </div>
          </div>
        )}
        
        {isDue && leftoverNewCards > 0 && (
           <div className="mb-8 opacity-60 text-xs uppercase tracking-widest text-[#c5a059]">
              Còn {leftoverNewCards} từ mới đang đợi được học vào ngày mai do đã đạt giới hạn học từ mới hôm nay.
           </div>
        )}

        {isDue ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
            <button 
              onClick={onStartReview}
              className="border border-[#c5a059] text-[#c5a059] bg-[#121212] hover:bg-[#c5a059] hover:text-black font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
            >
               Bắt đầu phiên ôn tập
            </button>
            {onStartFreeStudy && (
              <button 
                onClick={onStartFreeStudy}
                className="border border-[#2a2a2a] text-[#d4d4d4] bg-[#121212] hover:border-[#c5a059] hover:text-[#c5a059] font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                  Ôn tập tự do (Học nhồi)
              </button>
            )}
            {onStartDifficultReview && deck.length > 0 && (
              <button 
                onClick={onStartDifficultReview}
                className="border border-[#2a2a2a] text-[#d4d4d4] bg-[#121212] hover:border-red-500 hover:text-red-500 font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                  Ôn các từ hay quên
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
            <button 
              onClick={onNavigateAdd}
              className="border border-[#2a2a2a] text-[#d4d4d4] bg-[#121212] hover:border-[#c5a059] hover:text-[#c5a059] font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
            >
               Thêm từ vựng mới
            </button>
            {deck.length > 0 && onStartFreeStudy && (
               <button 
                 onClick={onStartFreeStudy}
                 className="border border-[#2a2a2a] text-[#d4d4d4] bg-[#121212] hover:border-[#c5a059] hover:text-[#c5a059] font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
               >
                  Ôn tập tự do (Học nhồi)
               </button>
            )}
            {deck.length > 0 && onStartDifficultReview && (
              <button 
                onClick={onStartDifficultReview}
                className="border border-[#2a2a2a] text-[#d4d4d4] bg-[#121212] hover:border-red-500 hover:text-red-500 font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                  Ôn các từ hay quên
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
