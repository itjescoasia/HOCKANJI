import React, { useState, useEffect, useMemo, useRef } from 'react';
import { KanjiCard, FuriganaMode } from '../types';
import { usePersistentState } from '../hooks/usePersistentState';
import { playAudioUrl } from '../utils/playTTS';
import Markdown from 'react-markdown';
import {
  Flame,
  RotateCcw,
  CheckCircle2,
  Brain,
  Volume2,
  BookOpen,
  ArrowRight,
  X,
  Copy,
  Check,
  Sparkles,
  ZapOff,
  Headphones,
  CheckSquare,
  Layers,
  Award,
  RefreshCw
} from 'lucide-react';
import { cleanMarkdownForDisplay } from '../utils/stringUtils';
import { FuriganaSentence, FuriganaToggle } from './FuriganaSentence';
import { HighlightProvider, renderExampleHighlight, HighlightVietnamese, RelatedHighlight } from '../utils/highlight';
import { getWordTypeBadgeStyle } from './VocabList';

interface ForgottenVocabSessionProps {
  deck: KanjiCard[];
  onClose: () => void;
  onUpdateCard?: (id: string, updates: Partial<KanjiCard>) => void;
  onRecordReview?: (isRemember: boolean) => void;
}

type StudyMode = 'flashcard' | 'mcq' | 'audio_first';

export default function ForgottenVocabSession({
  deck,
  onClose,
  onUpdateCard,
  onRecordReview,
}: ForgottenVocabSessionProps) {
  const [furiganaMode, setFuriganaMode] = usePersistentState<FuriganaMode>('app_furigana_mode', 'always');
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard');
  const [filterType, setFilterType] = useState<'all_difficult' | 'only_tagged'>('all_difficult');

  // Prepare initial pool of forgotten/difficult cards
  const pool = useMemo(() => {
    let list: KanjiCard[] = [];
    if (filterType === 'only_tagged') {
      list = deck.filter(c => c.isForgotten);
    } else {
      list = deck.filter(c => c.isForgotten || (c.difficultScore !== undefined && c.difficultScore < 0) || (c.interval <= 1 && c.repetition === 0));
    }

    if (list.length === 0) {
      // Fallback: If no words are flagged forgotten yet, take the lowest difficultScore or lowest interval
      list = [...deck].sort((a, b) => (a.difficultScore ?? 0) - (b.difficultScore ?? 0)).slice(0, 15);
    }

    // Sort scientifically:
    // 1. Manually tagged 'isForgotten' first (most recent forgottenAt first)
    // 2. Then by difficultScore ascending (most negative first)
    // 3. Then by interval
    return [...list].sort((a, b) => {
      const aTag = a.isForgotten ? 1 : 0;
      const bTag = b.isForgotten ? 1 : 0;
      if (aTag !== bTag) return bTag - aTag;
      if (a.isForgotten && b.isForgotten) {
        return (b.forgottenAt || 0) - (a.forgottenAt || 0);
      }
      return (a.difficultScore ?? 0) - (b.difficultScore ?? 0);
    });
  }, [deck, filterType]);

  // Dynamic review queue (supports re-inserting forgotten cards 2-3 steps ahead for micro-spaced repetition)
  const [queue, setQueue] = useState<KanjiCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedMcq, setSelectedMcq] = useState<string | null>(null);
  const [mcqIsCorrect, setMcqIsCorrect] = useState<boolean | null>(null);
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    reviewedCount: 0,
    rememberedCount: 0,
    forgottenCount: 0,
    graduatedCount: 0,
  });
  const [masteryStreaks, setMasteryStreaks] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  // Initialize queue
  useEffect(() => {
    if (pool.length > 0) {
      setQueue(pool);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [pool]);

  const currentCard = queue[currentIndex] || pool[0];

  // Generate 4 MCQ options when currentCard changes
  useEffect(() => {
    if (!currentCard) return;
    setIsFlipped(false);
    setSelectedMcq(null);
    setMcqIsCorrect(null);

    const correctAnswer = currentCard.meaning;
    // Find plausible distractors from the deck
    const otherMeanings = Array.from(
      new Set(
        deck
          .filter(c => c.id !== currentCard.id && c.meaning && c.meaning.trim() !== correctAnswer.trim())
          .map(c => c.meaning.trim())
      )
    );

    // Shuffle distractors
    for (let i = otherMeanings.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherMeanings[i], otherMeanings[j]] = [otherMeanings[j], otherMeanings[i]];
    }

    const distractors = otherMeanings.slice(0, 3);
    const options = [correctAnswer, ...distractors];

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    setMcqOptions(options);

    // If audio_first mode, auto-play MP3 if available
    if (studyMode === 'audio_first' && currentCard.audioUrl) {
      playAudioUrl(currentCard.audioUrl, currentCard.kanji || currentCard.reading);
    }
  }, [currentIndex, currentCard?.id, studyMode, deck]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === '1') {
        handleResponse(false);
      } else if (e.key === '2') {
        handleResponse(true);
      } else if (e.key === '3') {
        handleGraduateWord();
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentCard) {
          playAudioUrl(currentCard.audioUrl, currentCard.kanji || currentCard.reading);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, isFlipped, queue, currentIndex]);

  const handleCopy = (e: React.MouseEvent, text: string, key: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(prev => prev === key ? null : prev);
    }, 2000);
  };

  // Response handler (Remembered vs Still Forgotten)
  const handleResponse = (isRemembered: boolean) => {
    if (!currentCard) return;

    if (onRecordReview) {
      onRecordReview(isRemembered);
    }

    const cardId = currentCard.id;
    const currentStreak = (masteryStreaks[cardId] || 0) + (isRemembered ? 1 : 0);

    setMasteryStreaks(prev => ({
      ...prev,
      [cardId]: isRemembered ? currentStreak : 0,
    }));

    setSessionStats(prev => ({
      ...prev,
      reviewedCount: prev.reviewedCount + 1,
      rememberedCount: prev.rememberedCount + (isRemembered ? 1 : 0),
      forgottenCount: prev.forgottenCount + (!isRemembered ? 1 : 0),
    }));

    if (isRemembered) {
      // Scientific score recovery
      const newDifficultScore = Math.min(0, Math.floor((currentCard.difficultScore || 0) / 2) + 1);
      if (onUpdateCard) {
        onUpdateCard(cardId, {
          difficultScore: newDifficultScore,
          forgottenMasteryStreak: currentStreak,
        });
      }

      // If remembered 3 consecutive times, auto-graduate!
      if (currentStreak >= 3 && currentCard.isForgotten) {
        handleGraduateWord();
        return;
      }
    } else {
      // Spaced Retrieval insertion: Re-insert 2 to 3 cards later in the queue
      const newQueue = [...queue];
      const reInsertPos = Math.min(newQueue.length, currentIndex + 3);
      newQueue.splice(reInsertPos, 0, currentCard);
      setQueue(newQueue);

      if (onUpdateCard) {
        onUpdateCard(cardId, {
          difficultScore: (currentCard.difficultScore || 0) - 1,
          forgottenMasteryStreak: 0,
        });
      }
    }

    // Advance to next card
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFlipped(true); // completed last card
    }
  };

  // Graduate a word (remove isForgotten tag, restore confidence)
  const handleGraduateWord = () => {
    if (!currentCard) return;
    const cardId = currentCard.id;

    if (onUpdateCard) {
      onUpdateCard(cardId, {
        isForgotten: false,
        difficultScore: Math.max(0, (currentCard.difficultScore || 0) + 2),
        forgottenMasteryStreak: 3,
      });
    }

    setShowCelebration(currentCard.kanji || currentCard.reading);
    setSessionStats(prev => ({
      ...prev,
      graduatedCount: prev.graduatedCount + 1,
      rememberedCount: prev.rememberedCount + 1,
      reviewedCount: prev.reviewedCount + 1,
    }));

    setTimeout(() => {
      setShowCelebration(null);
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      }
    }, 1800);
  };

  // Toggle forgotten status manually
  const handleToggleForgottenDirect = (card: KanjiCard) => {
    const nextVal = !card.isForgotten;
    if (onUpdateCard) {
      onUpdateCard(card.id, {
        isForgotten: nextVal,
        forgottenAt: nextVal ? Date.now() : card.forgottenAt,
        forgottenCount: nextVal ? (card.forgottenCount || 0) + 1 : card.forgottenCount,
      });
    }
  };

  const isCompleted = currentIndex >= queue.length && queue.length > 0;
  const currentStreak = currentCard ? (masteryStreaks[currentCard.id] || 0) : 0;
  const progressPercent = queue.length > 0 ? Math.round(((currentIndex) / queue.length) * 100) : 0;

  return (
    <div
      id="forgotten-vocab-session-overlay"
      className="fixed inset-0 z-50 bg-theme-base flex flex-col overflow-hidden animate-in fade-in duration-200 select-text"
    >
      {/* Top Header Bar */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-theme-subtle bg-theme-panel/90 backdrop-blur shrink-0 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
            <Flame className="w-5 h-5 fill-rose-500/30" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-theme-primary uppercase tracking-wider">
                Chuyên Mục: Ôn Các Từ Vựng Hay Quên
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30 uppercase tracking-widest">
                Khoa học Active Recall
              </span>
            </div>
            <p className="text-[11px] text-theme-primary/60 hidden sm:block">
              Chu kỳ ngắt quãng ngắn Ebbinghaus • Phục hồi trí nhớ các từ bạn đã gán 'QUÊN' hoặc điểm khó cao
            </p>
          </div>
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden md:flex flex-col items-end gap-1 min-w-[120px]">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-theme-primary/80">
              <span>{Math.min(currentIndex + 1, queue.length)}</span>
              <span className="opacity-40">/</span>
              <span>{queue.length} từ</span>
            </div>
            <div className="w-28 h-2 bg-theme-base-alt rounded-full overflow-hidden border border-theme-subtle">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <FuriganaToggle mode={furiganaMode} onChange={setFuriganaMode} />

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-theme-primary/60 hover:text-theme-primary hover:bg-theme-hover transition-colors cursor-pointer"
            title="Thoát phiên ôn (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mode Switcher & Filter Ribbon */}
      <div className="px-4 sm:px-8 py-2.5 bg-theme-panel/40 border-b border-theme-subtle flex items-center justify-between gap-3 flex-wrap text-xs">
        {/* Study Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-theme-base border border-theme-subtle shadow-xs">
          <button
            type="button"
            onClick={() => setStudyMode('flashcard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              studyMode === 'flashcard'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thẻ Flashcard</span>
          </button>

          <button
            type="button"
            onClick={() => setStudyMode('mcq')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              studyMode === 'mcq'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Trắc nghiệm 4 đáp án</span>
          </button>

          <button
            type="button"
            onClick={() => setStudyMode('audio_first')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              studyMode === 'audio_first'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Nghe MP3 phản xạ</span>
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-theme-primary/60 hidden sm:inline">Nguồn từ:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-theme-base border border-theme-subtle text-theme-primary text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-rose-500"
          >
            <option value="all_difficult">Tất cả từ khó &amp; gán Quên ({deck.filter(c => c.isForgotten || (c.difficultScore && c.difficultScore < 0)).length} từ)</option>
            <option value="only_tagged">Chỉ các từ ĐÃ GÁN QUÊN ({deck.filter(c => c.isForgotten).length} từ)</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-between relative">
        {/* Celebration Overlay Popup */}
        {showCelebration && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-theme-panel border border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-1">
                Chúc mừng! Đã khắc phục từ:
              </h3>
              <div className="text-3xl font-serif font-bold text-emerald-500 my-2">
                {showCelebration}
              </div>
              <p className="text-xs text-theme-primary/70 mb-4">
                Từ vựng này đã được gỡ nhãn "HAY QUÊN" và phục hồi điểm trí nhớ thành công!
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tiến độ phục hồi +1 từ</span>
              </div>
            </div>
          </div>
        )}

        {/* Finished Session View */}
        {isCompleted ? (
          <div className="my-auto max-w-xl w-full bg-theme-panel border border-theme-subtle rounded-3xl p-8 text-center shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-theme-primary mb-2">
              Hoàn Thành Phiên Ôn Từ Hay Quên!
            </h2>
            <p className="text-xs sm:text-sm text-theme-primary/70 max-w-md mx-auto mb-6 leading-relaxed">
              Bạn vừa hoàn tất chu kỳ ôn ngắt quãng khoa học. Luyện tập đều đặn giúp vỏ não chuyển từ vựng từ trí nhớ ngắn hạn sang trí nhớ vĩnh viễn.
            </p>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
              <div className="p-3 bg-theme-base-alt rounded-2xl border border-theme-subtle text-center">
                <div className="text-2xl font-bold text-theme-primary font-serif">{sessionStats.reviewedCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-semibold mt-0.5">Lượt ôn</div>
              </div>
              <div className="p-3 bg-theme-base-alt rounded-2xl border border-theme-subtle text-center">
                <div className="text-2xl font-bold text-emerald-500 font-serif">{sessionStats.rememberedCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-600/80 font-semibold mt-0.5">Đã nhớ</div>
              </div>
              <div className="p-3 bg-theme-base-alt rounded-2xl border border-theme-subtle text-center">
                <div className="text-2xl font-bold text-amber-500 font-serif">{sessionStats.graduatedCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-amber-600/80 font-semibold mt-0.5">Đã gỡ quên</div>
              </div>
              <div className="p-3 bg-theme-base-alt rounded-2xl border border-theme-subtle text-center">
                <div className="text-2xl font-bold text-rose-500 font-serif">{sessionStats.forgottenCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-rose-600/80 font-semibold mt-0.5">Cần lặp lại</div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setQueue(pool);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ôn lại phiên này</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 bg-theme-base-alt hover:bg-theme-subtle text-theme-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-theme-subtle"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        ) : currentCard ? (
          <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-auto py-2">
            {/* Memory Streak Indicator Pill */}
            <div className="mb-3 flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                <Flame className="w-3.5 h-3.5 fill-rose-500/40" />
                <span>{currentCard.isForgotten ? 'Đang gán: HAY QUÊN' : 'Từ điểm khó cao'}</span>
              </div>

              {/* Recovery Streak dots (3 dots for graduation) */}
              <div className="flex items-center gap-1 bg-theme-panel border border-theme-subtle px-2.5 py-1 rounded-full text-xs" title="Nhớ đúng 3 lần liên tiếp trong phiên sẽ tự động gỡ nhãn Hay Quên">
                <span className="text-[10px] text-theme-primary/60 font-semibold mr-1">Phục hồi:</span>
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentStreak >= step
                        ? 'bg-emerald-500 scale-110 shadow-xs'
                        : 'bg-theme-subtle/60'
                    }`}
                  />
                ))}
              </div>

              {/* Direct Un-tag / Re-tag button */}
              <button
                type="button"
                onClick={() => handleToggleForgottenDirect(currentCard)}
                className="text-[11px] font-bold text-theme-primary/50 hover:text-rose-500 hover:underline transition-colors cursor-pointer"
                title="Bấm để bật/tắt nhãn Hay Quên cho từ này"
              >
                {currentCard.isForgotten ? 'Gỡ nhãn' : 'Gán quên'}
              </button>
            </div>

            {/* The Main Study Card */}
            <div
              onClick={() => {
                if (studyMode === 'flashcard' && !isFlipped) {
                  setIsFlipped(true);
                }
              }}
              className={`w-full min-h-[360px] sm:min-h-[420px] bg-theme-panel border border-theme-subtle rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${
                studyMode === 'flashcard' && !isFlipped ? 'cursor-pointer hover:border-rose-500/50' : ''
              }`}
            >
              {/* Card Top Information Bar */}
              <div className="p-4 sm:p-6 pb-2 border-b border-theme-subtle/50 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {currentCard.wordType && (
                    <span className={getWordTypeBadgeStyle(currentCard.wordType, "text-xs px-2.5 py-0.5")}>
                      {currentCard.wordType}
                    </span>
                  )}
                  {currentCard.sinoVietnamese && (
                    <span className="text-xs font-bold uppercase tracking-wider bg-theme-accent/15 text-theme-accent border border-theme-accent/30 px-2 py-0.5 rounded-md">
                      {currentCard.sinoVietnamese}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentCard.audioUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudioUrl(currentCard.audioUrl, currentCard.kanji || currentCard.reading);
                      }}
                      className="p-2 rounded-xl bg-theme-accent/10 hover:bg-theme-accent text-theme-accent hover:text-theme-inverted transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                      title="Nghe phát âm chuẩn MP3 (Phím R)"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">MP3</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body - Content changes based on studyMode & isFlipped */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center">
                {studyMode === 'audio_first' && !isFlipped ? (
                  /* Audio-First mode: Play audio, conceal Kanji until flipped */
                  <div className="flex flex-col items-center gap-4 py-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudioUrl(currentCard.audioUrl, currentCard.kanji || currentCard.reading);
                      }}
                      className="w-20 h-20 rounded-full bg-rose-500/15 border-2 border-rose-500/40 text-rose-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg group"
                    >
                      <Volume2 className="w-9 h-9 group-hover:animate-pulse" />
                    </button>
                    <div className="text-sm font-semibold text-theme-primary/70">
                      Bấm để nghe phát âm và tự nhớ nghĩa từ vựng
                    </div>
                    {currentCard.wordType && (
                      <span className="text-xs text-theme-primary/50">
                        Loại từ: {currentCard.wordType}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Standard Kanji / Word display */
                  <div className="flex flex-col items-center gap-2">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-theme-primary tracking-tight">
                      {currentCard.kanji || currentCard.reading}
                    </h2>

                    {currentCard.kanji && currentCard.reading && currentCard.kanji !== currentCard.reading && (
                      <div className="text-xl sm:text-2xl font-serif text-theme-accent font-medium mt-1">
                        {currentCard.reading}
                      </div>
                    )}

                    {currentCard.romaji && (
                      <div className="text-xs sm:text-sm font-sans text-theme-primary/60 italic">
                        [{currentCard.romaji}]
                      </div>
                    )}
                  </div>
                )}

                {/* Answer Revealed Section (when isFlipped or MCQ answered) */}
                {isFlipped ? (
                  <div className="mt-6 pt-6 border-t border-theme-subtle w-full flex flex-col items-center gap-4 animate-in fade-in duration-200">
                    <div className="text-xl sm:text-2xl font-bold text-rose-500 uppercase tracking-wide">
                      {currentCard.meaning}
                    </div>

                    {/* Kanji explanation if exists */}
                    {currentCard.kanjiExplanation && (
                      <div className="max-w-xl text-left bg-theme-base-alt/80 p-3.5 rounded-xl border border-theme-subtle text-xs text-theme-primary/80 leading-relaxed">
                        <span className="font-bold text-theme-accent block mb-1">Giải nghĩa Hán tự:</span>
                        <Markdown>{cleanMarkdownForDisplay(currentCard.kanjiExplanation)}</Markdown>
                      </div>
                    )}

                    {/* Example sentences */}
                    {currentCard.examples && currentCard.examples.length > 0 && (
                      <div className="w-full max-w-xl mt-2 text-left space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-theme-primary/60 block">
                          Câu ví dụ minh họa:
                        </span>
                        {currentCard.examples.slice(0, 2).map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="p-3 rounded-xl bg-theme-base border border-theme-subtle flex items-start justify-between gap-3"
                          >
                            <div className="flex-1">
                              <div className="text-sm sm:text-base font-serif text-theme-primary">
                                {furiganaMode === 'off' ? (
                                  ex.sentence
                                ) : (
                                  <FuriganaSentence
                                    sentence={ex.sentence}
                                    furigana={ex.furigana}
                                    mode={furiganaMode}
                                    deck={deck}
                                    autoFetch={true}
                                  />
                                )}
                              </div>
                              <div className="text-xs text-theme-primary/70 mt-1">
                                <HighlightVietnamese text={ex.translation} />
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleCopy(e, ex.sentence, `ex-${exIdx}`)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  copiedKey === `ex-${exIdx}`
                                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                                    : 'border-theme-subtle text-theme-primary/60 hover:text-theme-primary hover:bg-theme-hover'
                                }`}
                                title="Sao chép câu tiếng Nhật"
                              >
                                {copiedKey === `ex-${exIdx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              {ex.audioUrl && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playAudioUrl(ex.audioUrl, ex.sentence);
                                  }}
                                  className="p-1.5 rounded-lg border border-theme-subtle text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors cursor-pointer"
                                  title="Nghe câu ví dụ"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : studyMode === 'mcq' ? (
                  /* MCQ 4-Option interactive grid */
                  <div className="mt-6 w-full max-w-xl">
                    <div className="text-xs font-semibold text-theme-primary/60 mb-3 uppercase tracking-wider">
                      Chọn ý nghĩa đúng nhất của từ:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                      {mcqOptions.map((opt, i) => {
                        const isSelected = selectedMcq === opt;
                        const isCorrectOption = opt.trim().toLowerCase() === currentCard.meaning.trim().toLowerCase();
                        let btnStyle = 'border-theme-subtle bg-theme-base-alt hover:border-rose-500/60 hover:bg-theme-hover text-theme-primary';

                        if (selectedMcq !== null) {
                          if (isCorrectOption) {
                            btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-500 font-bold';
                          }
                        }

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (selectedMcq !== null) return;
                              setSelectedMcq(opt);
                              const isCorrect = isCorrectOption;
                              setMcqIsCorrect(isCorrect);
                              setIsFlipped(true);
                              if (isCorrect) {
                                setTimeout(() => handleResponse(true), 1200);
                              } else {
                                setTimeout(() => handleResponse(false), 2000);
                              }
                            }}
                            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer shadow-xs ${btnStyle}`}
                          >
                            <span className="w-6 h-6 rounded-full bg-theme-panel border border-theme-subtle flex items-center justify-center text-xs font-mono font-bold shrink-0">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-xs sm:text-sm line-clamp-2">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Prompt to reveal answer */
                  <div className="mt-8 text-xs font-semibold text-theme-primary/50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Bấm vào thẻ hoặc phím Space để xem nghĩa &amp; câu ví dụ</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer Hint */}
              <div className="p-3 bg-theme-base-alt/40 border-t border-theme-subtle/50 text-[11px] text-theme-primary/50 flex items-center justify-between px-6">
                <span>Điểm khó hiện tại: <strong className="text-rose-500">{currentCard.difficultScore ?? 0}</strong></span>
                <span className="hidden sm:inline">Phím tắt: Space (Lật), 1 (Quên), 2 (Nhớ), 3 (Gỡ quên)</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Bottom Response Controls (Active Recall Feedback) */}
        {!isCompleted && currentCard && (
          <div className="w-full max-w-3xl pt-3 pb-2 shrink-0 z-10">
            {!isFlipped && studyMode !== 'mcq' ? (
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 hover:brightness-110 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20"
              >
                <span>Lật thẻ xem đáp án &amp; giải thích</span>
                <span className="text-xs font-mono bg-black/20 text-white px-2.5 py-1 rounded-xl font-bold">
                  Phím Space
                </span>
              </button>
            ) : isFlipped && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                {/* Button 1: Still forgotten */}
                <button
                  type="button"
                  onClick={() => handleResponse(false)}
                  className="py-3.5 px-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-xs hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                    <span>Vẫn chưa nhớ</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20">1</kbd>
                  </div>
                  <span className="text-[11px] opacity-75">Lặp lại ngay sau 2 - 3 thẻ</span>
                </button>

                {/* Button 2: Remembered */}
                <button
                  type="button"
                  onClick={() => handleResponse(true)}
                  className="py-3.5 px-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-xs hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Đã nhớ được</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20">2</kbd>
                  </div>
                  <span className="text-[11px] opacity-75">Tăng độ phục hồi trí nhớ</span>
                </button>

                {/* Button 3: Graduate now */}
                <button
                  type="button"
                  onClick={handleGraduateWord}
                  className="py-3.5 px-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-xs hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Đã nhớ vững (Gỡ Quên)</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20">3</kbd>
                  </div>
                  <span className="text-[11px] opacity-75">Gỡ nhãn Hay Quên ngay</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
