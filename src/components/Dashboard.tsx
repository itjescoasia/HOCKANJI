import React, { useMemo, useEffect, Fragment } from "react";
import { KanjiCard, IntensiveWord, IntensiveExample } from "../types";
import { UserStats } from "../hooks/useStudyStats";
import { getLocalDateString, getVietnamDate } from "../lib/dateUtils";
import { renderExampleHighlight, RelatedHighlight } from "../utils/highlight";
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
  onStartSentenceReview?: (mode: "JA_TO_VI" | "VI_TO_JA") => void;
  onNavigateAdd: () => void;
  onRecordWordOfTheDay?: (id: string) => void;
}

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
}: DashboardProps) {

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
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

  // Sync back to stats if WOTD changes and we have a function
  useEffect(() => {
    if (sentenceOfTheDay && onRecordWordOfTheDay && !stats[todayStr]?.wotdId) {
      onRecordWordOfTheDay(sentenceOfTheDay.example.id);
    }
  }, [sentenceOfTheDay, onRecordWordOfTheDay, stats, todayStr]);


  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full flex flex-col gap-6">
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
                <h2 className="text-[10px] uppercase tracking-widest text-theme-accent mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-theme-accent rounded-full inline-block"></span>
                  Mỗi ngày 1 câu
                </h2>
                
                <div className="flex items-start gap-2 mt-4">
                  <p className="text-xl sm:text-2xl text-theme-primary leading-relaxed font-serif">
                    {renderExampleHighlight(
                      sentenceOfTheDay.example.sentence,
                      sentenceOfTheDay.word.word,
                      deck,
                    )}
                  </p>
                  <button
                    onClick={(e) => playAudio(e, sentenceOfTheDay.example.sentence)}
                    className="p-1.5 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 mt-1"
                    title="Nghe câu"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

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
                <p className="text-base text-theme-primary/80 mt-3 leading-relaxed">
                  {sentenceOfTheDay.example.translation}
                </p>

                <div className="mt-6 border-t border-theme-subtle pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-serif text-theme-primary">
                      {sentenceOfTheDay.word.word}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                    {sentenceOfTheDay.word.reading && (
                      <span className="text-sm text-theme-primary opacity-80">
                        {sentenceOfTheDay.word.reading}
                      </span>
                    )}
                    {sentenceOfTheDay.word.romaji && (
                      <span className="text-xs text-theme-primary opacity-60 font-serif italic">
                        {sentenceOfTheDay.word.romaji}
                      </span>
                    )}
                  </div>
                  {sentenceOfTheDay.word.category && (
                    <span className="text-[10px] uppercase border border-theme-accent/40 text-theme-accent px-2 py-0.5 rounded opacity-80 self-start sm:self-auto mt-1 sm:mt-0">
                      {sentenceOfTheDay.word.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-theme-primary opacity-90 max-w-2xl mt-2">
                  {sentenceOfTheDay.word.explanation}
                </p>
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
          <Zap className="w-6 h-6 text-blue-500 mb-4 opacity-70" />
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif text-theme-primary">
              {todayStats.newLearned || 0}
            </span>
            <span className="text-[11px] text-theme-primary opacity-40 uppercase tracking-widest mb-1">
              / 15
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-blue-400 opacity-70">
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

      <div className="bg-theme-base border border-theme-subtle p-8 sm:p-14 text-center relative overflow-hidden mt-2">
        <h2 className="text-2xl sm:text-3xl font-serif mb-4 relative z-10 text-theme-accent tracking-widest uppercase">
          {isDue
            ? `Cần thực hiện: Ôn ${dueCards.length} từ`
            : "Tuyệt vời, chưa có từ nào cần ôn"}
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
            <div className="bg-theme-hover border border-theme-subtle inline-flex items-center gap-2 px-4 py-2 opacity-80">
              <span className="w-2 h-2 rounded-full bg-theme-accent"></span>
              <span className="text-xs uppercase tracking-widest text-theme-primary">
                Hiện đang còn{" "}
                <strong className="text-theme-accent">
                  {leftoverNewCards} từ mới
                </strong>{" "}
                chờ bạn khám phá vào ngày mai!
              </span>
            </div>
          </div>
        )}

        {isDue && leftoverNewCards > 0 && (
          <div className="mb-8 opacity-60 text-xs uppercase tracking-widest text-theme-accent">
            Còn {leftoverNewCards} từ mới đang đợi được học vào ngày mai do đã
            đạt giới hạn học từ mới hôm nay.
          </div>
        )}

        {isDue ? (
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center relative z-10">
            <button
              onClick={onStartReview}
              className="border border-theme-accent text-theme-accent bg-theme-panel hover:bg-theme-accent hover:text-theme-inverted font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
            >
              Bắt đầu phiên ôn tập
            </button>
            {onStartShortStudy && deck.length > 0 && (
              <button
                onClick={onStartShortStudy}
                className="border border-theme-subtle text-theme-accent bg-theme-panel hover:border-theme-accent hover:bg-theme-hover font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Học ngắn (5 từ hay quên)
              </button>
            )}
            {onStartFreeStudy && (
              <button
                onClick={onStartFreeStudy}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn tập tự do (Học nhồi)
              </button>
            )}
            {onStartDifficultReview && deck.length > 0 && (
              <button
                onClick={onStartDifficultReview}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-red-500 hover:text-red-500 font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn các từ hay quên
              </button>
            )}
            {onStartSentenceReview && (
              <button
                onClick={() => onStartSentenceReview("JA_TO_VI")}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn câu (Nhật → Việt)
              </button>
            )}
            {onStartSentenceReview && (
              <button
                onClick={() => onStartSentenceReview("VI_TO_JA")}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn câu (Việt → Nhật)
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center relative z-10">
            <button
              onClick={onNavigateAdd}
              className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
            >
              Thêm từ vựng mới
            </button>
            {deck.length > 0 && onStartShortStudy && (
              <button
                onClick={onStartShortStudy}
                className="border border-theme-subtle text-theme-accent bg-theme-panel hover:border-theme-accent hover:bg-theme-hover font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Học ngắn (5 từ hay quên)
              </button>
            )}
            {deck.length > 0 && onStartFreeStudy && (
              <button
                onClick={onStartFreeStudy}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn tập tự do (Học nhồi)
              </button>
            )}
            {deck.length > 0 && onStartDifficultReview && (
              <button
                onClick={onStartDifficultReview}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-red-500 hover:text-red-500 font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn các từ hay quên
              </button>
            )}
            {onStartSentenceReview && (
              <button
                onClick={() => onStartSentenceReview("JA_TO_VI")}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn câu (Nhật → Việt)
              </button>
            )}
            {onStartSentenceReview && (
              <button
                onClick={() => onStartSentenceReview("VI_TO_JA")}
                className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                Ôn câu (Việt → Nhật)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
