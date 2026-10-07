import { playTTS , playAudioUrl} from '../utils/playTTS';
import React, { useMemo, useEffect, Fragment } from "react";
import { KanjiCard, IntensiveWord, IntensiveExample, FuriganaMode } from "../types";
import { UserStats } from "../hooks/useStudyStats";
import { getLocalDateString, getVietnamDate } from "../lib/dateUtils";
import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";
import { FuriganaSentence, FuriganaToggle } from "./FuriganaSentence";
import { usePersistentState } from "../hooks/usePersistentState";
import {
  BookOpen,
  Brain,
  Clock,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Shuffle,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Play,
  Flame,
  CheckCircle2,
  Headphones,
  RotateCcw
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardProps {
  deck: KanjiCard[];
  intensiveDeck?: IntensiveWord[];
  dueCards: KanjiCard[];
  leftoverNewCards?: number;
  stats?: UserStats;
  onStartReview: () => void;
  onStartFreeStudy?: () => void;
  onStartDifficultReview?: () => void;
  onStartShortStudy?: () => void;
  onStartSentenceReview?: (mode: "JA_TO_VI" | "VI_TO_JA", targetDeck?: any[] | null, forceAll?: boolean, isRandom?: boolean) => void;
  onNavigateAdd?: () => void;
  onRecordWordOfTheDay?: (id: string) => void;
  onNavigateToWord?: (word: string, isIntensive: boolean, id: string) => void;
  onNavigateToQuiz?: () => void;
}

import { cleanTextForSearch } from "../utils/stringUtils";

export default function Dashboard({
  deck,
  intensiveDeck = [],
  dueCards,
  leftoverNewCards = 0,
  stats = {},
  onStartReview,
  onStartFreeStudy,
  onStartDifficultReview,
  onStartShortStudy,
  onStartSentenceReview,
  onNavigateAdd,
  onRecordWordOfTheDay,
  onNavigateToWord,
  onNavigateToQuiz,
}: DashboardProps) {

  const [furiganaMode, setFuriganaMode] = usePersistentState<FuriganaMode>('app_furigana_mode', 'always');
  const [searchQuery, setSearchQuery] = React.useState("");

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = cleanTextForSearch(searchQuery);
    
    const normalMatches = deck.filter(c => 
      cleanTextForSearch(c.kanji).includes(query) || 
      cleanTextForSearch(c.reading).includes(query) || 
      cleanTextForSearch(c.meaning).includes(query) ||
      (c.examples || []).some(ex => cleanTextForSearch(ex.sentence || '').includes(query) || cleanTextForSearch(ex.translation || '').includes(query)) ||
      (c.example && cleanTextForSearch(c.example).includes(query)) ||
      (c.exampleTranslation && cleanTextForSearch(c.exampleTranslation).includes(query))
    ).map(c => ({ type: 'normal', word: c.kanji, reading: c.reading, meaning: c.meaning, id: c.id, item: c }));

    const intensiveMatches = intensiveDeck.filter(c =>
      cleanTextForSearch(c.word).includes(query) || 
      cleanTextForSearch(c.reading || '').includes(query) || 
      cleanTextForSearch(c.explanation || '').includes(query) ||
      (c.examples || []).some(ex => cleanTextForSearch(ex.sentence || '').includes(query) || cleanTextForSearch(ex.translation || '').includes(query))
    ).map(c => ({ type: 'intensive', word: c.word, reading: c.reading || '', meaning: c.explanation || '', id: c.id, item: c }));

    return [...normalMatches, ...intensiveMatches].slice(0, 8);
  }, [searchQuery, deck, intensiveDeck]);

  const playAudio = (e: React.MouseEvent, text: string, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      playAudioUrl(audioUrl, text);
      return;
    }
    if (text) playTTS(text);
  };

  const isDue = dueCards.length > 0;

  // Cấp độ ghi nhớ
  const matureCards = deck.filter((c) => c.interval >= 21).length;
  const learningCards = deck.filter(
    (c) => c.interval > 0 && c.interval < 21,
  ).length;
  const newCards = deck.filter((c) => c.interval === 0).length;

  const totalCards = deck.length;

  // Chart 1: Word Type Distribution Data
  const wordTypeData = useMemo(() => {
    const stats: Record<string, number> = {
      "Danh từ": 0,
      "Động từ": 0,
      "Tính từ": 0,
      "Ngữ pháp": 0,
      "Khác/Chưa phân loại": 0,
    };

    const processType = (type?: string) => {
      if (!type) {
        stats["Khác/Chưa phân loại"]++;
        return;
      }
      if (type.includes("Danh từ")) stats["Danh từ"]++;
      else if (type.includes("Động từ")) stats["Động từ"]++;
      else if (type.includes("Tính từ")) stats["Tính từ"]++;
      else if (type.includes("Ngữ pháp")) stats["Ngữ pháp"]++;
      else stats["Khác/Chưa phân loại"]++;
    };

    deck.forEach((word) => processType(word.wordType));
    intensiveDeck.forEach((word) => processType(word.category));

    const colors = ["#c5a059", "#4a4a4a", "#8b5a2b", "#2a2a2a", "#1a1a1a"];

    return Object.entries(stats)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .filter((item) => item.value > 0);
  }, [deck, intensiveDeck]);

  // Chart 2: 7-Day Forecast Data
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const forecastData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = deck.filter((c) => {
      if (i === 0) {
        return c.nextReviewDate < nextDate.getTime();
      } else {
        return (
          c.nextReviewDate >= date.getTime() &&
          c.nextReviewDate < nextDate.getTime()
        );
      }
    }).length;

    return {
      date: date.toLocaleDateString("vi-VN", { weekday: "short" }),
      count,
      name: "Số từ",
    };
  });

  // Calculate Progress Stats
  const todayStr = getLocalDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  const todayStats = stats[todayStr] || {
    reviewed: 0,
    correct: 0,
    mastered: 0,
    newLearned: 0,
  };
  const yesterdayStats = stats[yesterdayStr] || {
    reviewed: 0,
    correct: 0,
    mastered: 0,
    newLearned: 0,
  };

  // Tiến độ ôn tập hôm nay
  const studiedToday = Number(todayStats.reviewed) || 0;
  const todayGoal = studiedToday + dueCards.length;
  const todayProgressRate =
    todayGoal > 0 ? Math.round((studiedToday / todayGoal) * 100) : 100;

  const reviewedDiff = (Number(todayStats.reviewed) || 0) - (Number(yesterdayStats.reviewed) || 0);
  const correctRateToday =
    todayStats.reviewed > 0
      ? Math.round(((todayStats.correct || 0) / todayStats.reviewed) * 100)
      : 0;
  const correctRateYesterday =
    yesterdayStats.reviewed > 0
      ? Math.round(((yesterdayStats.correct || 0) / yesterdayStats.reviewed) * 100)
      : 0;
  const errorRateDiff = 100 - correctRateToday - (100 - correctRateYesterday); // negative means fewer errors today

  const studyHistoryData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = getLocalDateString(d);
    const s = stats[dStr] || {
      reviewed: 0,
      correct: 0,
      mastered: 0,
      newLearned: 0,
      freeStudyTime: 0,
    };
    return {
      date: d.toLocaleDateString("vi-VN", { weekday: "short" }),
      reviewed: Number(s.reviewed) || 0,
      correct: Number(s.correct) || 0,
      newLearned: Number(s.newLearned) || 0,
      freeStudyTimeMinutes: Math.ceil((Number(s.freeStudyTime) || 0) / 60),
    };
  });

  // Calculate Sentence of the Day
  const todayForSeed = getVietnamDate();
  const seed =
    todayForSeed.getFullYear() * 10000 +
    (todayForSeed.getMonth() + 1) * 100 +
    todayForSeed.getDate();

  const sentenceOfTheDay = useMemo(() => {
    let allExamples: { word: IntensiveWord, example: IntensiveExample }[] = [];
    intensiveDeck.forEach(word => {
      word.examples.forEach(ex => {
        allExamples.push({ word, example: ex });
      });
    });

    if (allExamples.length === 0) return null;

    const syncedWotdId = stats[todayStr]?.wotdId;
    if (syncedWotdId) {
      const cached = allExamples.find((c) => c.example.id === syncedWotdId);
      if (cached) {
        return cached;
      }
    }

    const unmastered = allExamples.filter(item => item.example.viToJaMastered === false);
    
    let selectedList = unmastered.length > 0 ? unmastered : allExamples;
    
    return selectedList[seed % selectedList.length];
  }, [intensiveDeck, seed, stats, todayStr]);

  const wotdAttemptedRef = React.useRef<string | null>(null);

  // Sync back to stats if WOTD changes and we have a function
  useEffect(() => {
    if (sentenceOfTheDay && onRecordWordOfTheDay && !stats[todayStr]?.wotdId) {
      const wotdId = sentenceOfTheDay.example.id;
      if (wotdAttemptedRef.current !== wotdId) {
        wotdAttemptedRef.current = wotdId;
        onRecordWordOfTheDay(wotdId);
      }
    }
  }, [sentenceOfTheDay, onRecordWordOfTheDay, stats, todayStr]);


  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative z-[100] mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-theme-primary opacity-40" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm từ vựng..." 
          className="w-full bg-theme-panel border border-theme-subtle py-3 pl-10 pr-4 text-theme-primary placeholder-theme-primary/30 focus:outline-none focus:border-theme-accent transition-colors text-sm shadow-sm rounded-sm"
        />
        {searchQuery.trim() && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-theme-panel border border-theme-subtle shadow-xl overflow-hidden rounded-sm max-h-[300px] overflow-y-auto">
            {searchResults.map((res, i) => (
              <button 
                key={`${res.type}-${res.id}-${i}`}
                className="w-full text-left px-4 py-3 hover:bg-theme-hover border-b border-theme-subtle last:border-b-0 flex items-center justify-between"
                onClick={() => {
                  setSearchQuery("");
                  if (onNavigateToWord) onNavigateToWord(res.word, res.type === 'intensive', res.id);
                }}
              >
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="text-sm font-serif text-theme-primary truncate">{res.word}</span>
                  <span className="text-xs text-theme-primary/60 truncate">{res.reading} {res.reading && res.meaning ? '•' : ''} {res.meaning}</span>
                </div>
                <span className={`shrink-0 text-[10px] px-2 py-0.5 uppercase tracking-widest rounded-sm ${res.type === 'intensive' ? 'bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border border-[var(--badge-amber-border)]' : 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border border-[var(--badge-emerald-border)]'}`}>
                  {res.type === 'intensive' ? 'Chuyên sâu' : 'Từ vựng'}
                </span>
              </button>
            ))}
          </div>
        )}
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-theme-panel border border-theme-subtle shadow-xl overflow-hidden rounded-sm px-4 py-3">
             <span className="text-xs text-theme-primary/60 italic">Không tìm thấy từ vựng nào phù hợp</span>
          </div>
        )}
      </div>
      {/* Search Bar End */}

      <div className="mb-2 text-center sm:text-left">
        <h1
          className="text-3xl sm:text-4xl font-serif text-theme-accent tracking-widest mb-3 uppercase"
          style={{ fontFamily: "serif" }}
        >
          Thống Kê Học Tập
        </h1>
        <p className="text-[11px] text-theme-primary opacity-50 uppercase tracking-[0.2em]">
          Tiến độ học và biểu diễn dữ liệu
        </p>
      </div>

      {/* N4 Quiz Quick Launch Banner */}
      {onNavigateToQuiz && (
        <div 
          onClick={onNavigateToQuiz}
          className="bg-gradient-to-r from-emerald-950/40 via-theme-panel to-emerald-950/30 border border-emerald-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-emerald-500 transition-all rounded-sm group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  Chức năng mới
                </span>
                <h3 className="text-sm sm:text-base font-bold text-theme-primary group-hover:text-emerald-400 transition-colors">
                  Trắc Nghiệm Tiếng Nhật N4 (Đề thi &amp; Giải thích chi tiết)
                </h3>
              </div>
              <p className="text-xs text-theme-primary/70 mt-1">
                Luyện tập thể khả năng (Bài 27), trợ từ (が, しか), tự/tha động từ, ý chí, bị động, sai khiến kèm bảng từ vựng và audio chuẩn.
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigateToQuiz(); }}
            className="px-4 py-2 bg-emerald-600 group-hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors whitespace-nowrap self-end sm:self-auto flex items-center gap-1.5 cursor-pointer shadow"
          >
            Làm bài test
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sentence of the Day */}
      {sentenceOfTheDay && (
        <div className="bg-theme-panel border border-theme-accent p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none hidden sm:block">
            <span className="text-8xl font-serif whitespace-nowrap max-w-full overflow-hidden text-ellipsis block">
              {sentenceOfTheDay.word.word}
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] uppercase tracking-widest text-theme-accent flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-theme-accent rounded-full inline-block"></span>
                    Mỗi ngày 1 câu
                  </h2>
                  <FuriganaToggle mode={furiganaMode} onChange={setFuriganaMode} />
                </div>
                
                <HighlightProvider><>
                <div className="flex items-start gap-2 mt-2">
                  <div className="text-xl sm:text-2xl text-theme-primary leading-relaxed font-serif whitespace-pre-wrap">
                    {furiganaMode === 'off' ? (
                      renderExampleHighlight(
                        sentenceOfTheDay.example.sentence,
                        sentenceOfTheDay.word.word,
                        deck,
                      )
                    ) : (
                      <FuriganaSentence
                        sentence={sentenceOfTheDay.example.sentence}
                        furigana={sentenceOfTheDay.example.furigana}
                        mode={furiganaMode}
                        deck={deck}
                        autoFetch={true}
                      />
                    )}
                  </div>
                  <button
                    onClick={(e) => playAudio(e, sentenceOfTheDay.example.sentence, sentenceOfTheDay.example.audioUrl)}
                    className="p-1.5 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 mt-1"
                    title="Nghe câu"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {furiganaMode === 'off' && (
                  <div className="flex gap-3 mt-2">
                    {sentenceOfTheDay.example.reading && (
                      <span className="text-sm text-theme-primary opacity-70 italic">
                        <RelatedHighlight text={sentenceOfTheDay.example.reading} type="hiragana" />
                      </span>
                    )}
                    {sentenceOfTheDay.example.romaji && (
                      <span className="text-sm text-theme-primary opacity-50 font-serif italic">
                        <RelatedHighlight text={sentenceOfTheDay.example.romaji} type="romaji" />
                      </span>
                    )}
                  </div>
                )}
                <p className="text-base text-theme-primary/80 mt-3 leading-relaxed">
                  <HighlightVietnamese text={sentenceOfTheDay.example.translation || ""} />
                </p></></HighlightProvider>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col relative overflow-hidden">
          <BookOpen className="w-6 h-6 text-theme-accent mb-4 opacity-70" />
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif text-theme-primary">
              {deck.length}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-theme-accent opacity-70">
            Tổng Số Thẻ Từ
          </span>
        </div>
        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <Clock className="w-6 h-6 text-red-500 mb-4 opacity-70" />
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif text-theme-primary">
              {dueCards.length}
            </span>
            <span className="text-[11px] text-theme-primary opacity-40 uppercase tracking-widest mb-1">
              / 150
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-red-400 opacity-70">
            Cần Ôn Tập
          </span>
        </div>
        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <Zap className="w-6 h-6  mb-4 opacity-70" />
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif text-theme-primary">
              {todayStats.newLearned || 0}
            </span>
            <span className="text-[11px] text-theme-primary opacity-40 uppercase tracking-widest mb-1">
              / 15
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest  opacity-70">
            Thẻ Mới Đã Học
          </span>
        </div>
        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <Brain className="w-6 h-6 text-theme-accent mb-4 opacity-70" />
          <span
            className="text-4xl font-serif text-theme-primary mb-2"
            style={{ fontFamily: "serif" }}
          >
            {matureCards}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-theme-accent opacity-70">
            Từ Đã Khắc Sâu (&gt;21 ngày)
          </span>
        </div>
        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <Target className="w-6 h-6 text-theme-accent mb-4 opacity-70" />
          <span
            className="text-4xl font-serif text-theme-primary mb-2"
            style={{ fontFamily: "serif" }}
          >
            {todayProgressRate}%
          </span>
          <span className="text-[10px] uppercase tracking-widest text-theme-accent opacity-70">
            Tiến độ hôm nay
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <h3 className="text-[11px] font-sans text-theme-primary opacity-60 tracking-widest uppercase mb-8">
            Lịch sử ôn tập (7 ngày qua)
          </h3>
          <div className="h-[250px] w-full flex-1 relative">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={studyHistoryData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  stroke="var(--border-subtle)"
                  tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--border-subtle)"
                  tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  cursor={{ fill: "var(--bg-hover)" }}
                  contentStyle={{
                    backgroundColor: "var(--bg-panel)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "4px",
                  }}
                  itemStyle={{ color: "var(--text-primary)", fontSize: "12px" }}
                  labelStyle={{
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reviewed"
                  name="Đã ôn"
                  stroke="var(--text-muted)"
                  strokeWidth={2}
                  dot={{ fill: "var(--text-muted)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="newLearned"
                  name="Đã nhớ"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <h3 className="text-[11px] font-sans text-theme-primary opacity-60 tracking-widest uppercase mb-8">
            Tỉ lệ loại từ trong CSDL
          </h3>
          <div className="h-[250px] w-full flex-1 relative">
            {wordTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={wordTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {wordTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-panel)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "4px",
                    }}
                    itemStyle={{
                      color: "var(--text-primary)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 uppercase tracking-widest">
                Chưa có dữ liệu từ loại
              </div>
            )}
          </div>
          {wordTypeData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {wordTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-theme-primary opacity-70 tracking-widest uppercase">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Forecast & Free Study Time Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <h3 className="text-[11px] font-sans text-theme-primary opacity-60 tracking-widest uppercase mb-6">
            Lịch trình ôn tập (7 ngày tới)
          </h3>
          <div className="h-[250px] w-full flex-1 mt-6 relative">
            {deck.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={forecastData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke="var(--border-subtle)"
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--border-subtle)"
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "var(--bg-hover)" }}
                    contentStyle={{
                      backgroundColor: "var(--bg-panel)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "4px",
                    }}
                    itemStyle={{ color: "#c5a059", fontSize: "12px" }}
                    labelStyle={{
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Số từ"
                    fill="var(--accent)"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 uppercase tracking-widest">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        <div className="bg-theme-panel p-6 border border-theme-subtle flex flex-col">
          <h3 className="text-[11px] font-sans text-theme-primary opacity-60 tracking-widest uppercase mb-6">
            Thời gian học nhồi (7 ngày qua)
          </h3>
          <div className="h-[250px] w-full flex-1 mt-6 relative">
            {studyHistoryData.some((d) => d.freeStudyTimeMinutes > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={studyHistoryData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke="var(--border-subtle)"
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--border-subtle)"
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "var(--bg-hover)" }}
                    contentStyle={{
                      backgroundColor: "var(--bg-panel)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "4px",
                    }}
                    itemStyle={{ color: "#4a90e2", fontSize: "12px" }}
                    labelStyle={{
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  />
                  <Bar
                    dataKey="freeStudyTimeMinutes"
                    name="Phút"
                    fill="#4a90e2"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 uppercase tracking-widest text-theme-primary text-center px-4">
                Bạn chưa học nhồi trong 7 ngày qua.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-theme-panel to-theme-base/80 border border-theme-subtle rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-xl mt-2">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-theme-accent/10 blur-3xl pointer-events-none rounded-full" />

        {/* Status Header */}
        <div className="relative z-10 flex flex-col items-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md ${
            isDue 
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-500' 
              : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-500'
          }`}>
            {isDue ? <Flame className="w-7 h-7 stroke-[2.2]" /> : <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-theme-primary mb-2 tracking-tight">
            {isDue ? (
              <span>Cần ôn tập hôm nay: <strong className="text-theme-accent">{dueCards.length} từ vựng</strong></span>
            ) : (
              <span>Tuyệt vời! Bạn đã hoàn thành các từ cần ôn</span>
            )}
          </h2>

          <p className="text-theme-primary/70 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            {isDue
              ? "Ứng dụng thuật toán ngắt quãng (Spaced Repetition) để củng cố trí nhớ dài hạn vào đúng thời điểm bạn sắp quên."
              : deck.length === 0
                ? "Kho từ vựng trống. Hãy bắt đầu thêm từ mới hoặc nhập file Excel để bắt đầu học nhé!"
                : "Không còn từ vựng nào đến hạn ôn hôm nay. Bạn có thể luyện tập tự do hoặc ôn câu âm thanh bên dưới."}
          </p>
        </div>

        {/* Leftover cards pill if available */}
        {leftoverNewCards > 0 && (
          <div className="mb-8 w-full flex justify-center relative z-10">
            <div className="bg-theme-hover/80 border border-theme-subtle inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
              <span className="text-xs text-theme-primary/80">
                Đang có <strong className="text-theme-accent font-bold">{leftoverNewCards} từ mới</strong> chờ bạn khám phá vào ngày mai!
              </span>
            </div>
          </div>
        )}

        {/* Study Actions Container (div:nth-of-type(2)) */}
        <div className="flex flex-col gap-6 items-center relative z-10 w-full max-w-3xl mx-auto">
          {/* Primary Action Button (button:nth-of-type(1)) */}
          {isDue ? (
            <button
              onClick={onStartReview}
              className="relative group w-full sm:w-auto min-w-[280px] sm:min-w-[340px] px-8 sm:px-12 py-4 bg-gradient-to-r from-theme-accent via-amber-500 to-theme-accent hover:brightness-110 text-theme-inverted font-bold text-sm sm:text-base tracking-wide rounded-2xl shadow-xl shadow-theme-accent/20 hover:shadow-2xl hover:shadow-theme-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-between sm:justify-center gap-4 cursor-pointer overflow-hidden border border-white/20"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <div className="uppercase tracking-wider font-extrabold text-xs sm:text-sm leading-tight">
                    Bắt đầu phiên ôn tập
                  </div>
                  <div className="text-[11px] font-normal opacity-85 leading-tight mt-0.5">
                    Thuật toán ghi nhớ ngắt quãng SRS
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono bg-black/20 text-theme-inverted px-3 py-1.5 rounded-xl font-bold border border-white/10 flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {dueCards.length} từ
              </span>
            </button>
          ) : (
            <button
              onClick={onNavigateAdd}
              className="w-full sm:w-auto px-8 sm:px-12 py-3.5 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-white/20"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Thêm từ vựng mới vào kho</span>
            </button>
          )}

          {/* Secondary Study Modes Grid */}
          <div className="w-full pt-4 border-t border-theme-subtle/80">
            <div className="text-[11px] font-bold text-theme-primary/50 uppercase tracking-widest mb-3 text-center sm:text-left">
              Chế độ học &amp; luyện tập bổ trợ
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full text-left">
              {deck.length > 0 && onStartShortStudy && (
                <button
                  type="button"
                  onClick={onStartShortStudy}
                  className="p-3.5 rounded-xl border border-theme-subtle bg-theme-panel/70 hover:bg-theme-hover hover:border-theme-accent/60 transition-all flex items-start gap-3 cursor-pointer group text-left shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
                      Học ngắn 5 phút
                    </div>
                    <div className="text-[11px] text-theme-primary/60 truncate mt-0.5">
                      Củng cố nhanh 5 từ hay quên nhất
                    </div>
                  </div>
                </button>
              )}

              {deck.length > 0 && onStartFreeStudy && (
                <button
                  type="button"
                  onClick={onStartFreeStudy}
                  className="p-3.5 rounded-xl border border-theme-subtle bg-theme-panel/70 hover:bg-theme-hover hover:border-theme-accent/60 transition-all flex items-start gap-3 cursor-pointer group text-left shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
                      Ôn tập tự do (Học nhồi)
                    </div>
                    <div className="text-[11px] text-theme-primary/60 truncate mt-0.5">
                      Luyện trắc nghiệm không tính SRS
                    </div>
                  </div>
                </button>
              )}

              {deck.length > 0 && onStartDifficultReview && (
                <button
                  type="button"
                  onClick={onStartDifficultReview}
                  className="p-3.5 rounded-xl border border-theme-subtle bg-theme-panel/70 hover:bg-theme-hover hover:border-red-500/60 transition-all flex items-start gap-3 cursor-pointer group text-left shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-theme-primary group-hover:text-red-500 transition-colors">
                      Ôn các từ hay quên
                    </div>
                    <div className="text-[11px] text-theme-primary/60 truncate mt-0.5">
                      Tập trung từ có điểm khó cao
                    </div>
                  </div>
                </button>
              )}

              {onStartSentenceReview && (
                <button
                  type="button"
                  onClick={() => onStartSentenceReview("JA_TO_VI", null, false, true)}
                  className="p-3.5 rounded-xl border border-theme-subtle bg-theme-panel/70 hover:bg-theme-hover hover:border-theme-accent/60 transition-all flex items-start gap-3 cursor-pointer group text-left shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
                      Ôn ngẫu nhiên MP3 (Nhật → Việt)
                    </div>
                    <div className="text-[11px] text-theme-primary/60 truncate mt-0.5">
                      Nghe hiểu phản xạ câu tiếng Nhật
                    </div>
                  </div>
                </button>
              )}

              {onStartSentenceReview && (
                <button
                  type="button"
                  onClick={() => onStartSentenceReview("VI_TO_JA", null, false, true)}
                  className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/15 hover:bg-indigo-950/30 hover:border-indigo-500/60 transition-all flex items-start gap-3 cursor-pointer group text-left shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 group-hover:underline">
                        Dịch câu Khoa học SRS (Việt → Nhật)
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
                        Ebbinghaus
                      </span>
                    </div>
                    <div className="text-[11px] text-theme-primary/60 truncate mt-0.5">
                      Lấy ngẫu nhiên ví dụ có MP3 • Lặp lại câu quên theo khoa học
                    </div>
                  </div>
                </button>
              )}

              {onNavigateToQuiz && (
                <button
                  type="button"
                  onClick={onNavigateToQuiz}
                  className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-500/60 transition-all flex items-start gap-3 cursor-pointer group text-left shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                      Trắc nghiệm N4 (Đề thi)
                    </div>
                    <div className="text-[11px] text-theme-primary/60 truncate mt-0.5">
                      Bài test ngữ pháp &amp; từ vựng N4
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
