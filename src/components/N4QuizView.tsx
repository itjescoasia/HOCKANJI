import React, { useState, useMemo, useEffect } from 'react';
import { QuizTopic, QuizQuestion } from '../types';
import { n4QuizTopics, getAllN4Questions } from '../data/n4QuizData';
import { generateInfiniteN4Quiz } from '../utils/n4QuizGenerator';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Shuffle, 
  Volume2, 
  Award, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  CheckSquare, 
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Filter,
  Zap,
  Flame,
  Timer,
  Trophy,
  RefreshCw
} from 'lucide-react';
import { playTTS } from '../utils/playTTS';

interface N4QuizViewProps {
  onBackToDashboard?: () => void;
  onNavigateToWord?: (word: string) => void;
}

interface LifetimeQuizStats {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  maxStreak: number;
}

export const N4QuizView: React.FC<N4QuizViewProps> = ({
  onBackToDashboard,
  onNavigateToWord
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('infinite-n4-mode');
  const [viewMode, setViewMode] = useState<'scroll' | 'step'>('scroll');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'correct' | 'incorrect'>('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Dynamic batch size for infinite generator
  const [infiniteBatchSize, setInfiniteBatchSize] = useState<number>(20);
  const [infiniteQuestions, setInfiniteQuestions] = useState<QuizQuestion[]>(() => generateInfiniteN4Quiz(20, Date.now()));

  // Timer for Mock Test
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Lifetime stats from localStorage
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeQuizStats>(() => {
    try {
      const saved = localStorage.getItem('kanji_n4_quiz_lifetime_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read lifetime stats', e);
    }
    return { totalAnswered: 0, totalCorrect: 0, currentStreak: 0, maxStreak: 0 };
  });

  const saveLifetimeStats = (newStats: LifetimeQuizStats) => {
    setLifetimeStats(newStats);
    try {
      localStorage.setItem('kanji_n4_quiz_lifetime_stats', JSON.stringify(newStats));
    } catch (e) {
      console.warn('Could not save lifetime stats', e);
    }
  };

  // User answers state: questionId -> selectedOptionIndex (0, 1, 2, 3)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  // Active topic questions with optional shuffle
  const [shuffledSeed, setShuffledSeed] = useState<number>(0);

  // Active topic
  const activeTopic = useMemo(() => {
    if (selectedTopicId === 'infinite-n4-mode') {
      return {
        id: 'infinite-n4-mode',
        title: '🔥 LUYỆN TẬP VÔ TẬN N4 (Hàng nghìn câu không giới hạn)',
        subtitle: 'Hệ thống tự động sinh hàng nghìn câu hỏi trắc nghiệm mới liên tục (Trợ từ, Động từ, Ngữ pháp, Kanji)',
        level: 'N4',
        questions: infiniteQuestions
      } as QuizTopic;
    }
    if (selectedTopicId === 'mock-test-n4') {
      const all = getAllN4Questions();
      return {
        id: 'mock-test-n4',
        title: '🏆 Đề Thi Thử Chuẩn JLPT N4 (35 câu có tính giờ & điểm)',
        subtitle: 'Đề thi tổng hợp đầy đủ các phần Từ vựng, Kanji, Ngữ pháp câu, Điền trợ từ chuẩn format kỳ thi N4',
        level: 'N4',
        questions: all.length >= 35 ? all.slice(0, 35) : [...all, ...generateInfiniteN4Quiz(35 - all.length, 999)]
      } as QuizTopic;
    }
    return n4QuizTopics.find(t => t.id === selectedTopicId) || n4QuizTopics[0];
  }, [selectedTopicId, infiniteQuestions]);

  const questions: QuizQuestion[] = useMemo(() => {
    let list = [...activeTopic.questions];
    if (shuffledSeed > 0) {
      // Fisher-Yates shuffle
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }
    return list;
  }, [activeTopic, shuffledSeed]);

  // Mock test timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Start timer automatically when selecting Mock test
  useEffect(() => {
    if (selectedTopicId === 'mock-test-n4') {
      setTimerSeconds(45 * 60);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [selectedTopicId]);

  // Filtered questions based on status filter
  const displayedQuestions = useMemo(() => {
    return questions.filter((q) => {
      const answered = userAnswers[q.id] !== undefined;
      if (filterMode === 'unanswered') return !answered;
      if (filterMode === 'correct') return answered && userAnswers[q.id] === q.correctIndex;
      if (filterMode === 'incorrect') return answered && userAnswers[q.id] !== q.correctIndex;
      return true;
    });
  }, [questions, userAnswers, filterMode]);

  // Statistics for current batch
  const stats = useMemo(() => {
    const total = questions.length;
    let answeredCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    questions.forEach((q) => {
      if (userAnswers[q.id] !== undefined) {
        answeredCount++;
        if (userAnswers[q.id] === q.correctIndex) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    });

    const percent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    return { total, answeredCount, correctCount, incorrectCount, percent };
  }, [questions, userAnswers]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (userAnswers[questionId] !== undefined) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));

    // Find question
    const q = questions.find(item => item.id === questionId);
    if (!q) return;

    const isCorrect = optionIdx === q.correctIndex;
    const nextTotalAnswered = lifetimeStats.totalAnswered + 1;
    const nextTotalCorrect = lifetimeStats.totalCorrect + (isCorrect ? 1 : 0);
    const nextStreak = isCorrect ? lifetimeStats.currentStreak + 1 : 0;
    const nextMaxStreak = Math.max(lifetimeStats.maxStreak, nextStreak);

    saveLifetimeStats({
      totalAnswered: nextTotalAnswered,
      totalCorrect: nextTotalCorrect,
      currentStreak: nextStreak,
      maxStreak: nextMaxStreak
    });
  };

  const handleGenerateNewInfiniteBatch = (count: number = infiniteBatchSize) => {
    const newQuestions = generateInfiniteN4Quiz(count, Date.now() + Math.floor(Math.random() * 10000));
    setInfiniteQuestions(newQuestions);
    setUserAnswers({});
    setCurrentStepIdx(0);
    setFilterMode('all');
  };

  const handleResetCurrentQuiz = () => {
    if (window.confirm('Bạn có chắc muốn làm lại bài trắc nghiệm này từ đầu không?')) {
      setUserAnswers({});
      setCurrentStepIdx(0);
    }
  };

  const handleShuffle = () => {
    setShuffledSeed((prev) => prev + 1);
    setCurrentStepIdx(0);
  };

  const handlePlayAudio = async (q: QuizQuestion) => {
    const textToSpeak = q.plainSentence || q.question.replace(/<[^>]*>/g, '').replace(/[（）()]/g, '');
    if (!textToSpeak) return;

    try {
      setPlayingAudioId(q.id);
      await playTTS(textToSpeak);
    } catch (err) {
      console.warn('Audio playback error:', err);
    } finally {
      setTimeout(() => setPlayingAudioId(null), 1200);
    }
  };

  // Rank badge based on lifetime questions answered
  const userRank = useMemo(() => {
    const count = lifetimeStats.totalAnswered;
    if (count >= 1000) return { title: '👑 Đại Cao Thủ N4', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
    if (count >= 500) return { title: '💎 Bậc Thầy N4', color: 'text-purple-400 bg-purple-500/20 border-purple-500/40' };
    if (count >= 200) return { title: '🥇 Chiến Binh N4', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' };
    if (count >= 50) return { title: '🥈 Chăm Chỉ N4', color: 'text-blue-400 bg-blue-500/20 border-blue-500/40' };
    return { title: '🥉 Tân Binh N4', color: 'text-theme-primary/70 bg-theme-base-alt border-theme-subtle' };
  }, [lifetimeStats.totalAnswered]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 w-full flex-1">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 text-theme-primary/70 hover:text-theme-accent hover:bg-theme-hover rounded-lg transition-colors border border-theme-subtle"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                JLPT N4
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-theme-accent flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-emerald-500" />
                Kho Trắc Nghiệm Tiếng Nhật N4 Vô Tận
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-theme-primary/70 mt-0.5">
              Hàng nghìn câu hỏi ngữ pháp, trợ từ, thể động từ &amp; từ vựng chuẩn Minna no Nihongo N4
            </p>
          </div>
        </div>

        {/* View Mode & Topic Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="bg-theme-panel border border-theme-subtle rounded-lg p-0.5 flex items-center">
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'scroll'
                  ? 'bg-theme-accent text-white shadow'
                  : 'text-theme-primary/70 hover:text-theme-accent'
              }`}
              title="Xem danh sách tất cả câu"
            >
              <Layers className="w-3.5 h-3.5" />
              Cuộn tất cả
            </button>
            <button
              onClick={() => setViewMode('step')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'step'
                  ? 'bg-theme-accent text-white shadow'
                  : 'text-theme-primary/70 hover:text-theme-accent'
              }`}
              title="Xem từng câu một (Flashcard test)"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Từng câu
            </button>
          </div>
        </div>
      </div>

      {/* Lifetime Stats Counter Bar */}
      <div className="bg-theme-panel border border-theme-subtle rounded-xl p-3 px-4 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-theme-primary/70">Cấp bậc:</span>
          <span className={`px-2 py-0.5 font-bold rounded border text-[11px] ${userRank.color}`}>
            {userRank.title}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div title="Tổng số câu trắc nghiệm N4 bạn đã làm từ trước đến nay">
            <span className="text-theme-primary/60">Đã cày: </span>
            <strong className="text-theme-accent text-sm">{lifetimeStats.totalAnswered}</strong> câu
          </div>
          <div>
            <span className="text-theme-primary/60">Đúng: </span>
            <strong className="text-emerald-400 text-sm">
              {lifetimeStats.totalAnswered > 0 ? Math.round((lifetimeStats.totalCorrect / lifetimeStats.totalAnswered) * 100) : 0}%
            </strong>
          </div>
          <div className="flex items-center gap-1" title="Chuỗi trả lời đúng liên tiếp hiện tại">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <strong className="text-orange-400 text-sm">{lifetimeStats.currentStreak}</strong>
            <span className="text-theme-primary/60 text-[10px]">(Kỷ lục: {lifetimeStats.maxStreak})</span>
          </div>
        </div>
      </div>

      {/* Topic selection dropdown & Actions Bar */}
      <div className="bg-theme-panel border border-theme-subtle rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-primary/60 mb-1.5 flex items-center justify-between">
              <span>Chọn Đề Thi / Chuyên Đề N4</span>
              {selectedTopicId === 'mock-test-n4' && (
                <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  Thời gian: {formatTimer(timerSeconds)}
                </span>
              )}
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                setUserAnswers({});
                setCurrentStepIdx(0);
                setFilterMode('all');
              }}
              className="w-full bg-theme-base-alt border border-theme-subtle rounded-lg px-3 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-accent cursor-pointer font-medium"
            >
              <optgroup label="🌟 Chế độ Vô Hạn &amp; Thi Thử Chuẩn">
                <option value="infinite-n4-mode">
                  🔥 LUYỆN TẬP VÔ TẬN N4 (Sinh hàng nghìn câu ngẫu nhiên)
                </option>
                <option value="mock-test-n4">
                  🏆 Đề Thi Thử Chuẩn JLPT N4 (35 câu có tính giờ &amp; điểm)
                </option>
              </optgroup>
              <optgroup label="📚 Từng Bài Theo Minna no Nihongo (Bài 26 - 50)">
                {n4QuizTopics.filter(t => t.id !== 'infinite-n4-mode' && t.id !== 'mock-test-n4').map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title} ({topic.questions.length} câu)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 flex-wrap">
            {selectedTopicId === 'infinite-n4-mode' && (
              <div className="flex items-center gap-1.5">
                <select
                  value={infiniteBatchSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value, 10);
                    setInfiniteBatchSize(size);
                    handleGenerateNewInfiniteBatch(size);
                  }}
                  className="bg-theme-base-alt border border-theme-subtle rounded-lg px-2 py-1.5 text-xs text-theme-primary cursor-pointer font-medium"
                  title="Số câu sinh ra mỗi đợt"
                >
                  <option value={10}>10 câu</option>
                  <option value={20}>20 câu</option>
                  <option value={30}>30 câu</option>
                  <option value={50}>50 câu</option>
                  <option value={100}>100 câu</option>
                </select>
                <button
                  onClick={() => handleGenerateNewInfiniteBatch(infiniteBatchSize)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
                  title="Tạo bộ câu hỏi ngẫu nhiên mới hoàn toàn"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Đề mới
                </button>
              </div>
            )}
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-theme-base-alt border border-theme-subtle hover:border-theme-accent text-theme-primary/80 hover:text-theme-accent rounded-lg transition-colors"
              title="Xáo trộn thứ tự các câu hỏi"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Xáo trộn
            </button>
            <button
              onClick={handleResetCurrentQuiz}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-theme-base-alt border border-theme-subtle hover:border-red-500/50 text-theme-primary/80 hover:text-red-400 rounded-lg transition-colors"
              title="Xóa kết quả và làm lại đề này"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Làm lại
            </button>
          </div>
        </div>

        {/* Topic Subtitle description */}
        <div className="mt-3 pt-3 border-t border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-theme-primary/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-theme-accent shrink-0" />
            <span>{activeTopic.subtitle}</span>
          </div>
          <div className="flex items-center gap-3 font-medium shrink-0">
            <span>Tổng: <strong>{questions.length} câu</strong></span>
            <span>Đã làm: <strong className="text-theme-accent">{stats.answeredCount}/{stats.total}</strong></span>
            {stats.answeredCount > 0 && (
              <span>Đúng: <strong className="text-emerald-500">{stats.correctCount} ({stats.percent}%)</strong></span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-theme-base-alt h-2 rounded-full mt-3 overflow-hidden border border-theme-subtle/50 flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${stats.total > 0 ? (stats.correctCount / stats.total) * 100 : 0}%` }}
            title={`Đúng: ${stats.correctCount} câu`}
          />
          <div 
            className="bg-red-500 h-full transition-all duration-300"
            style={{ width: `${stats.total > 0 ? (stats.incorrectCount / stats.total) * 100 : 0}%` }}
            title={`Sai: ${stats.incorrectCount} câu`}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-theme-subtle overflow-x-auto no-scrollbar">
          <span className="text-xs text-theme-primary/60 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Lọc:
          </span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-theme-accent text-white font-medium'
                : 'bg-theme-base-alt text-theme-primary/70 hover:text-theme-accent'
            }`}
          >
            Tất cả ({questions.length})
          </button>
          <button
            onClick={() => setFilterMode('unanswered')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filterMode === 'unanswered'
                ? 'bg-theme-accent text-white font-medium'
                : 'bg-theme-base-alt text-theme-primary/70 hover:text-theme-accent'
            }`}
          >
            Chưa làm ({questions.length - stats.answeredCount})
          </button>
          <button
            onClick={() => setFilterMode('correct')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filterMode === 'correct'
                ? 'bg-emerald-600 text-white font-medium'
                : 'bg-theme-base-alt text-emerald-400/80 hover:text-emerald-400'
            }`}
          >
            Đúng ({stats.correctCount})
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filterMode === 'incorrect'
                ? 'bg-red-600 text-white font-medium'
                : 'bg-theme-base-alt text-red-400/80 hover:text-red-400'
            }`}
          >
            Sai ({stats.incorrectCount})
          </button>
        </div>
      </div>

      {/* Completion Banner if all answered */}
      {stats.total > 0 && stats.answeredCount === stats.total && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-theme-panel to-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 sm:p-5 mb-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-emerald-400">
                Hoàn thành xuất sắc đợt trắc nghiệm N4!
              </h3>
              <p className="text-xs sm:text-sm text-theme-primary/80">
                Bạn đã trả lời đúng <strong>{stats.correctCount}/{stats.total} câu</strong> ({stats.percent}%).
                Tổng số câu bạn đã tích lũy trong sự nghiệp luyện N4: <strong>{lifetimeStats.totalAnswered} câu</strong>!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedTopicId === 'infinite-n4-mode' && (
              <button
                onClick={() => handleGenerateNewInfiniteBatch(infiniteBatchSize)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                Sinh {infiniteBatchSize} câu tiếp theo
              </button>
            )}
            <button
              onClick={handleResetCurrentQuiz}
              className="px-3 py-2 bg-theme-base-alt border border-theme-subtle text-theme-primary text-xs sm:text-sm font-semibold rounded-lg shadow transition-colors shrink-0"
            >
              Làm lại bài này
            </button>
          </div>
        </div>
      )}

      {/* Questions Content */}
      {displayedQuestions.length === 0 ? (
        <div className="bg-theme-panel border border-theme-subtle rounded-xl p-8 text-center">
          <p className="text-sm text-theme-primary/60">Không có câu hỏi nào khớp với bộ lọc hiện tại.</p>
          <button
            onClick={() => setFilterMode('all')}
            className="mt-3 px-4 py-1.5 bg-theme-hover text-theme-accent text-xs rounded-lg transition-colors"
          >
            Hiển thị tất cả câu
          </button>
        </div>
      ) : viewMode === 'scroll' ? (
        /* SCROLL VIEW (Matches user HTML card layout exactly) */
        <div className="space-y-6">
          {displayedQuestions.map((q, qIndex) => {
            const selectedOptIdx = userAnswers[q.id];
            const isAnswered = selectedOptIdx !== undefined;

            return (
              <QuizCardItem
                key={q.id}
                index={qIndex}
                question={q}
                selectedOptIdx={selectedOptIdx}
                isAnswered={isAnswered}
                onSelectOption={(optIdx) => handleSelectOption(q.id, optIdx)}
                isPlayingAudio={playingAudioId === q.id}
                onPlayAudio={() => handlePlayAudio(q)}
                onNavigateToWord={onNavigateToWord}
              />
            );
          })}

          {/* Endless "Next 20 Questions" big button at the bottom of the list */}
          {selectedTopicId === 'infinite-n4-mode' && (
            <div className="text-center pt-4 pb-8">
              <button
                onClick={() => {
                  handleGenerateNewInfiniteBatch(infiniteBatchSize);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5 animate-spin-reverse" />
                Tiếp tục tạo thêm {infiniteBatchSize} câu N4 mới (Vô tận)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STEP-BY-STEP (Flashcard / Exam view) */
        <div className="space-y-4">
          {displayedQuestions[currentStepIdx] && (
            <QuizCardItem
              index={currentStepIdx}
              question={displayedQuestions[currentStepIdx]}
              selectedOptIdx={userAnswers[displayedQuestions[currentStepIdx].id]}
              isAnswered={userAnswers[displayedQuestions[currentStepIdx].id] !== undefined}
              onSelectOption={(optIdx) => handleSelectOption(displayedQuestions[currentStepIdx].id, optIdx)}
              isPlayingAudio={playingAudioId === displayedQuestions[currentStepIdx].id}
              onPlayAudio={() => handlePlayAudio(displayedQuestions[currentStepIdx])}
              onNavigateToWord={onNavigateToWord}
            />
          )}

          {/* Step navigation controls */}
          <div className="flex items-center justify-between bg-theme-panel border border-theme-subtle rounded-xl p-3 px-4 shadow-sm">
            <button
              onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIdx === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-theme-subtle text-theme-primary/70 hover:text-theme-accent hover:border-theme-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Câu trước
            </button>

            <span className="text-xs font-semibold text-theme-primary/80">
              Câu {currentStepIdx + 1} / {displayedQuestions.length}
            </span>

            <button
              onClick={() => setCurrentStepIdx((prev) => Math.min(displayedQuestions.length - 1, prev + 1))}
              disabled={currentStepIdx >= displayedQuestions.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-theme-accent hover:bg-theme-accent-hover text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Câu tiếp
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* Component for a single Question Card */
interface QuizCardItemProps {
  index: number;
  question: QuizQuestion;
  selectedOptIdx?: number;
  isAnswered: boolean;
  onSelectOption: (optIdx: number) => void;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  onNavigateToWord?: (word: string) => void;
}

const QuizCardItem: React.FC<QuizCardItemProps> = ({
  index,
  question,
  selectedOptIdx,
  isAnswered,
  onSelectOption,
  isPlayingAudio,
  onPlayAudio,
  onNavigateToWord,
}) => {
  return (
    <div 
      className="bg-theme-panel border border-theme-subtle rounded-xl p-4 sm:p-6 shadow-sm transition-all duration-300"
      id={`quiz-card-${question.id}`}
    >
      {/* Question Title Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 text-[11px] font-bold bg-theme-hover text-theme-accent border border-theme-subtle rounded">
              Câu {index + 1}
            </span>
            {question.lesson && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-theme-base-alt text-theme-primary/60 border border-theme-subtle rounded">
                {question.lesson}
              </span>
            )}
            {isAnswered && (
              selectedOptIdx === question.correctIndex ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> Chưa chính xác
                </span>
              )
            )}
          </div>

          {/* Japanese Question Text with Ruby Furigana */}
          <div 
            className="text-base sm:text-xl font-medium text-theme-primary leading-[2.2] tracking-wide"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />
        </div>

        {/* Audio Button for Question */}
        <button
          onClick={onPlayAudio}
          className={`p-2 rounded-lg transition-colors shrink-0 ${
            isPlayingAudio 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' 
              : 'text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover border border-theme-subtle'
          }`}
          title="Nghe phát âm tiếng Nhật câu này"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {question.options.map((opt, optIdx) => {
          let btnStyle = 'bg-theme-base-alt border-theme-subtle text-theme-primary hover:border-theme-accent hover:bg-theme-hover/60';

          if (isAnswered) {
            if (optIdx === question.correctIndex) {
              // Correct button always turns emerald green
              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-sm ring-1 ring-emerald-500/50';
            } else if (optIdx === selectedOptIdx) {
              // User selected wrong button turns red
              btnStyle = 'bg-red-500/20 border-red-500 text-red-400 line-through';
            } else {
              // Other unselected options fade out
              btnStyle = 'bg-theme-base-alt/50 border-theme-subtle/50 text-theme-primary/40 opacity-60';
            }
          }

          return (
            <button
              key={optIdx}
              onClick={() => onSelectOption(optIdx)}
              disabled={isAnswered}
              className={`p-3 sm:p-3.5 px-4 rounded-lg border text-left text-sm sm:text-base transition-all duration-200 flex items-center justify-between ${btnStyle} ${
                !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
              }`}
            >
              <span>{opt}</span>
              {isAnswered && optIdx === question.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
              )}
              {isAnswered && optIdx === selectedOptIdx && optIdx !== question.correctIndex && (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Explanation Drawer (Shows immediately after selection) */}
      {isAnswered && (
        <div className="mt-4 pt-4 border-t-2 border-dashed border-theme-subtle animate-fadeIn space-y-4">
          {/* Full Sentence Callout */}
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-lg p-3 sm:p-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">
                Câu hoàn chỉnh:
              </div>
              <div 
                className="text-base sm:text-lg font-medium text-theme-primary leading-[2.2]"
                dangerouslySetInnerHTML={{ __html: question.fullSentence }}
              />
            </div>
            <button
              onClick={onPlayAudio}
              className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors shrink-0"
              title="Nghe câu hoàn chỉnh"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Translation */}
          <div className="text-xs sm:text-sm text-theme-primary/90">
            <strong className="text-theme-accent">Dịch nghĩa: </strong>
            <span className="font-medium">{question.translation}</span>
          </div>

          {/* Vocab Table */}
          {question.vocab && question.vocab.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-theme-primary/60 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-theme-accent" />
                Từ vựng trong câu:
              </div>
              <div className="overflow-x-auto rounded-lg border border-theme-subtle">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-theme-base-alt text-theme-primary/70 border-b border-theme-subtle">
                      <th className="py-2 px-3 font-semibold">Từ vựng</th>
                      <th className="py-2 px-3 font-semibold">Romaji</th>
                      <th className="py-2 px-3 font-semibold">Loại từ</th>
                      <th className="py-2 px-3 font-semibold">Nghĩa tiếng Việt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-subtle/50">
                    {question.vocab.map((v, vIdx) => (
                      <tr key={vIdx} className="hover:bg-theme-hover/40 transition-colors">
                        <td className="py-2 px-3 font-medium text-theme-primary">
                          <ruby>
                            {v.kanji}
                            <rt className="text-[10px] text-theme-primary/60">{v.hira}</rt>
                          </ruby>
                          {onNavigateToWord && (
                            <button
                              onClick={() => onNavigateToWord(v.kanji || v.hira)}
                              className="ml-2 text-[11px] text-theme-accent hover:underline opacity-70 hover:opacity-100"
                              title="Xem chi tiết trong kho từ vựng"
                            >
                              Tra
                            </button>
                          )}
                        </td>
                        <td className="py-2 px-3 text-theme-primary/70">{v.romaji}</td>
                        <td className="py-2 px-3 text-theme-primary/70">
                          <span className="px-1.5 py-0.5 text-[11px] bg-theme-base-alt rounded border border-theme-subtle/60">
                            {v.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-theme-primary/90 font-medium">{v.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grammar Explanation Note */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-theme-primary/90">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Giải thích ngữ pháp:
            </div>
            <div 
              className="leading-relaxed text-theme-primary/80"
              dangerouslySetInnerHTML={{ __html: question.grammar }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default N4QuizView;
