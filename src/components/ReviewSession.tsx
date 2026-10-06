import React, { useState, useEffect, Fragment, useRef } from 'react';
import { KanjiCard, ReviewGrade } from '../types';
import { usePersistentState } from '../hooks/usePersistentState';
import { playTTS, playAudioUrl } from '../utils/playTTS';
import Markdown from 'react-markdown';
import { 
  X, 
  Trash2, 
  Volume2, 
  VolumeX,
  Edit3, 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Award, 
  ChevronRight,
  BookOpen,
  Keyboard,
  HelpCircle,
  Lightbulb,
  Layers,
  ArrowRight,
  Clock,
  Zap,
  Repeat
} from 'lucide-react';
import { renderExampleHighlight, RelatedHighlight, HighlightVietnamese, HighlightProvider } from '../utils/highlight';
import ReviewEditForm from './ReviewEditForm';
import { getWordTypeBadgeStyle } from './VocabList';

interface ReviewSessionProps {
  deck?: KanjiCard[];
  dueCards: KanjiCard[];
  onReview: (id: string, grade: ReviewGrade) => void;
  onFreeStudyReview?: (id: string, isRemember: boolean) => void;
  onClose: () => void;
  onRemoveCard: (id: string) => void;
  onUpdateCard?: (id: string, data: Partial<KanjiCard>) => void;
  isFreeStudy?: boolean;
  isDifficultReview?: boolean;
}

export default function ReviewSession({
  deck = [],
  dueCards = [],
  onReview,
  onFreeStudyReview,
  onClose,
  onRemoveCard,
  onUpdateCard,
  isFreeStudy = false,
  isDifficultReview = false
}: ReviewSessionProps) {
  // Always ensure reviewQueue has cards if deck has cards
  const [reviewQueue, setReviewQueue] = useState<KanjiCard[]>(() => {
    if (dueCards && dueCards.length > 0) return dueCards;
    if (deck && deck.length > 0) return deck;
    return [];
  });

  const [currentIndexRaw, setCurrentIndex] = usePersistentState('app_reviewsession_currentIndex', 0);
  const [flippedState, setFlippedState] = usePersistentState<Record<number, boolean>>('app_reviewsession_flippedState', {});
  const [autoPlayAudio, setAutoPlayAudio] = usePersistentState<boolean>('app_reviewsession_autoplay_audio', true);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Sync reviewQueue when dueCards or deck changes
  useEffect(() => {
    if (dueCards && dueCards.length > 0) {
      setReviewQueue(dueCards);
    } else if (deck && deck.length > 0 && reviewQueue.length === 0) {
      setReviewQueue(deck);
    }
  }, [dueCards, deck]);

  // Safe index calculation
  const safeIndex = reviewQueue.length > 0 ? Math.min(Math.max(0, currentIndexRaw), reviewQueue.length - 1) : 0;
  const currentCard = reviewQueue[safeIndex] || deck[0];
  const showAnswer = flippedState[safeIndex] || false;
  const setShowAnswer = (val: boolean) => setFlippedState(prev => ({ ...prev, [safeIndex]: val }));

  const [successCounts, setSuccessCounts] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<KanjiCard>>({});
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [editingExampleId, setEditingExampleId] = useState<string | null>(null);
  const [editExampleForm, setEditExampleForm] = useState<{ sentence: string; translation?: string; reading?: string; romaji?: string }>({ sentence: "" });

  const [readingInput, setReadingInput] = useState('');
  const [inputError, setInputError] = useState(false);
  const [wrongMcqOption, setWrongMcqOption] = useState<string | null>(null);
  
  const [exerciseType, setExerciseType] = useState<'typing_reading' | 'mcq_meaning' | 'mcq_reading' | 'flip'>('flip');
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const cardContentRef = useRef<HTMLDivElement>(null);

  // Sync TTS events
  useEffect(() => {
    const handleTTSGenerated = (e: any) => {
      const { text, audioUrl } = e.detail;
      if (!text || !audioUrl) return;
      
      setReviewQueue(prev => prev.map(card => {
        let updated = false;
        const newCard = { ...card };
        
        if (newCard.examples) {
          newCard.examples = newCard.examples.map(ex => {
            if (ex.sentence === text && ex.audioUrl !== audioUrl) {
              updated = true;
              return { ...ex, audioUrl, hasAudio: true };
            }
            return ex;
          });
        }
        
        if (newCard.forms) {
          newCard.forms = newCard.forms.map(form => {
            if (form.value === text && form.audioUrl !== audioUrl) {
              updated = true;
              return { ...form, audioUrl, hasAudio: true };
            }
            return form;
          });
        }
        
        return updated ? newCard : card;
      }));
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, []);

  // Reset internal states when current index changes
  useEffect(() => {
    setReadingInput('');
    setInputError(false);
    setWrongMcqOption(null);
    if (cardContentRef.current) {
      cardContentRef.current.scrollTop = 0;
    }

    if (isFreeStudy && currentCard) {
      const correctAnswer = currentCard.meaning || '';
      const pool = (dueCards && dueCards.length > 0) ? dueCards : deck;
      const allOptions = Array.from(new Set(pool.map(c => c.meaning).filter(Boolean))) as string[];
      
      if (allOptions.length < 2) {
        setExerciseType('flip');
      } else {
        setExerciseType('mcq_meaning');
        const wrongOptions = allOptions.filter(o => String(o || "").trim().toLowerCase() !== String(correctAnswer || "").trim().toLowerCase());
        
        for (let i = wrongOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
        }
        
        const shuffledWrong = wrongOptions.slice(0, 9);
        const finalOptions = [correctAnswer, ...shuffledWrong];
        
        for (let i = finalOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
        }
        
        setMcqOptions(finalOptions);
      }
    } else {
      setExerciseType('flip');
    }
  }, [safeIndex, isFreeStudy, isDifficultReview, currentCard, dueCards, deck]);

  // Auto-play audio when card flips to back
  useEffect(() => {
    if (showAnswer && autoPlayAudio && currentCard) {
      const timer = setTimeout(() => {
        handleSpeak(null, currentCard.kanji || currentCard.reading, currentCard.audioUrl);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showAnswer, autoPlayAudio, safeIndex]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (isEditing || confirmingDeleteId || editingExampleId) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showShortcutHelp) {
          setShowShortcutHelp(false);
        } else {
          onClose();
        }
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutHelp(prev => !prev);
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (!showAnswer) {
          e.preventDefault();
          setShowAnswer(true);
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (currentCard) {
          handleSpeak(null, currentCard.kanji || currentCard.reading, currentCard.audioUrl);
        }
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (currentCard) {
          startEdit();
        }
        return;
      }

      if (showAnswer) {
        if (!isFreeStudy) {
          if (e.key === '1') {
            e.preventDefault();
            handleGrade('forgot');
          } else if (e.key === '2') {
            e.preventDefault();
            handleGrade('hard');
          } else if (e.key === '3') {
            e.preventDefault();
            handleGrade('good');
          } else if (e.key === '4') {
            e.preventDefault();
            handleGrade('easy');
          }
        } else {
          if (e.key === '1') {
            e.preventDefault();
            handleFreeStudyForgot();
          } else if (e.key === '2' || e.key === '3') {
            e.preventDefault();
            handleFreeStudyRemember();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, isEditing, confirmingDeleteId, editingExampleId, isFreeStudy, currentCard, safeIndex, showShortcutHelp]);

  // Loading state if deck is completely empty
  if (!currentCard && reviewQueue.length === 0) {
    return (
      <div className="fixed inset-0 bg-theme-base z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-theme-subtle border-t-theme-accent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-serif font-bold text-theme-primary mb-2">Đang tải từ vựng...</h3>
        <p className="text-xs text-theme-primary/60 max-w-sm mb-6">Hệ thống đang chuẩn bị danh sách thẻ học cho bạn.</p>
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-theme-subtle hover:bg-theme-hover text-xs font-bold uppercase tracking-wider">
          Quay lại Trang Chủ
        </button>
      </div>
    );
  }

  // Truly finished session view (when user reviewed all cards)
  const isFinished = reviewQueue.length > 0 && currentIndexRaw >= reviewQueue.length;
  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-theme-base z-50 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="bg-theme-panel border border-theme-subtle p-8 sm:p-12 text-center max-w-lg w-full rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Award className="w-10 h-10 stroke-[2.2]" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-3">
            Hoàn tất xuất sắc
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif text-theme-primary font-bold mb-3 tracking-tight">
            Phiên Học Đã Hoàn Thành!
          </h2>

          <p className="text-theme-primary/70 mb-8 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Bạn đã ôn tập xong toàn bộ <strong>{reviewQueue.length} từ vựng</strong> trong phiên này. Sự kiên trì mỗi ngày là chìa khóa để phản xạ tự nhiên.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 bg-theme-base-alt/70 p-4 rounded-2xl border border-theme-subtle">
            <div className="text-center p-2">
              <div className="text-3xl font-serif font-bold text-theme-accent">{reviewQueue.length}</div>
              <div className="text-[11px] text-theme-primary/60 uppercase tracking-wider font-medium mt-1">Từ đã ôn tập</div>
            </div>
            <div className="text-center p-2">
              <div className="text-3xl font-serif font-bold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-[11px] text-theme-primary/60 uppercase tracking-wider font-medium mt-1">Mục tiêu phiên</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setFlippedState({});
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl border border-theme-subtle hover:bg-theme-hover text-theme-primary text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ôn lại từ đầu</span>
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted font-bold py-3.5 px-4 rounded-2xl uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Trở về Trang Chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleGrade = (grade: ReviewGrade) => {
    onReview(currentCard.id, grade);
    setFlippedState(fs => ({ ...fs, [safeIndex + 1]: false }));
    setCurrentIndex(prev => prev + 1);
  };

  const handleFreeStudyRemember = () => {
    if (onFreeStudyReview) onFreeStudyReview(currentCard.id, true);
    
    const count = (successCounts[currentCard.id] || 0) + 1;
    setSuccessCounts(prev => ({ ...prev, [currentCard.id]: count }));

    if (count < 3) {
      setReviewQueue(prev => {
        const newQueue = [...prev];
        const offset = count === 1 ? 4 : 6;
        const insertIndex = Math.min(newQueue.length, safeIndex + offset);
        newQueue.splice(insertIndex, 0, currentCard);
        return newQueue;
      });
    }

    setFlippedState(fs => ({ ...fs, [safeIndex + 1]: false }));
    setCurrentIndex(prev => prev + 1);
  };

  const handleFreeStudyForgot = () => {
    if (onFreeStudyReview) onFreeStudyReview(currentCard.id, false);
    setReviewQueue(prev => [...prev, currentCard]);
    setFlippedState(fs => ({ ...fs, [safeIndex + 1]: false }));
    setCurrentIndex(prev => prev + 1);
  };

  const handleCheckReading = () => {
    if (String(readingInput || "").trim() === String(currentCard.reading || "").trim()) {
      setInputError(false);
      setShowAnswer(true);
    } else {
      setInputError(true);
    }
  };

  const handleMcqSelect = (option: string) => {
    const field = exerciseType === 'mcq_meaning' ? 'meaning' : 'reading';
    if (option === currentCard[field]) {
      setInputError(false);
      setWrongMcqOption(null);
      setShowAnswer(true);
    } else {
      setInputError(true);
      setWrongMcqOption(option);
    }
  };

  const handleDelete = () => {
    setConfirmingDeleteId(currentCard.id);
  };

  const handleSpeak = (e: React.MouseEvent | null, text: string, audioUrl?: string | null) => {
    if (e) e.stopPropagation();
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 1200);

    if (audioUrl) {
      playAudioUrl(audioUrl, text);
      return;
    }
    if (text) playTTS(text);
  };

  const totalGoal = (dueCards && dueCards.length > 0 ? dueCards.length : deck.length) * 3;
  const currentProgress = Object.values(successCounts).reduce((acc: number, count: number) => acc + Math.min(count, 3), 0) as number;
  const progressPercent = isFreeStudy 
    ? (totalGoal > 0 ? (currentProgress / totalGoal) * 100 : 0)
    : (reviewQueue.length > 0 ? ((safeIndex) / reviewQueue.length) * 100 : 0);
  const currentCardProgress = successCounts[currentCard?.id] || 0;

  const startEdit = () => {
    setEditForm(currentCard);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateCard && currentCard) {
      onUpdateCard(currentCard.id, editForm);
      setReviewQueue(prev => prev.map(c => c.id === currentCard.id ? { ...c, ...editForm } : c));
    }
    setIsEditing(false);
  };

  const modeTitle = isDifficultReview 
    ? 'Ôn từ hay quên (Khó)'
    : isFreeStudy 
      ? 'Ôn tập tự do (Học nhồi)' 
      : 'Ôn tập ngắt quãng SRS';

  // Fallback word display
  const primaryDisplayWord = currentCard.kanji || currentCard.reading || currentCard.meaning || 'Từ vựng';

  return (
    <div className="fixed inset-0 bg-theme-base z-50 font-sans text-theme-primary flex flex-col overflow-hidden select-none">
      
      {/* Top App Bar Header */}
      <header className="shrink-0 w-full bg-theme-panel/95 backdrop-blur-md border-b border-theme-subtle px-3 sm:px-6 py-2.5 z-20 flex items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Exit & Mode */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-subtle hover:bg-theme-hover text-theme-primary/70 hover:text-theme-primary transition-all text-xs font-medium cursor-pointer"
            title="Thoát phiên học (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Thoát</span>
            <kbd className="hidden md:inline text-[10px] font-mono opacity-50 px-1 rounded bg-theme-base-alt">Esc</kbd>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-theme-base-alt border border-theme-subtle">
            <span className={`w-2 h-2 rounded-full ${isDifficultReview ? 'bg-red-500' : isFreeStudy ? 'bg-blue-500' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-semibold text-theme-primary/80">{modeTitle}</span>
          </div>
        </div>

        {/* Center: Progress & Counter */}
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center gap-1 px-2">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-theme-primary/70">
            <span className="font-semibold text-theme-accent">
              Từ {safeIndex + 1} <span className="opacity-50">/</span> {reviewQueue.length}
            </span>
            <span className="opacity-60 text-[10px]">
              {reviewQueue.length - safeIndex} từ còn lại ({Math.round(progressPercent)}%)
            </span>
          </div>
          
          <div className="w-full h-2 bg-theme-base-alt rounded-full overflow-hidden border border-theme-subtle/50">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${isDifficultReview ? 'bg-red-500' : isFreeStudy ? 'bg-blue-500' : 'bg-theme-accent'}`}
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Autoplay Audio Toggle */}
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              autoPlayAudio 
                ? 'bg-theme-accent/10 border-theme-accent/30 text-theme-accent' 
                : 'border-theme-subtle text-theme-primary/50 hover:bg-theme-hover'
            }`}
            title={autoPlayAudio ? "Tự động phát âm thanh khi lật thẻ: Đang Bật" : "Tự động phát âm thanh: Đang Tắt"}
          >
            {autoPlayAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden xl:inline text-[11px] font-medium">Tự phát âm</span>
          </button>

          {/* Replay Current Word Audio */}
          {currentCard && (
            <button
              onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
              className="p-2 rounded-xl border border-theme-subtle hover:bg-theme-hover text-theme-primary/70 hover:text-theme-accent transition-all cursor-pointer"
              title="Phát âm từ vựng (Phím R)"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-theme-accent' : ''}`} />
            </button>
          )}

          {/* Quick Edit */}
          {!isEditing && (
            <button
              onClick={startEdit}
              className="p-2 rounded-xl border border-theme-subtle hover:bg-theme-hover text-theme-primary/70 hover:text-theme-primary transition-all cursor-pointer"
              title="Chỉnh sửa từ vựng (Phím E)"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Delete Card */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl border border-theme-subtle hover:border-red-500/30 hover:bg-red-500/10 text-theme-primary/40 hover:text-red-500 transition-all cursor-pointer"
            title="Xóa từ vựng"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Keyboard shortcut guide */}
          <button
            onClick={() => setShowShortcutHelp(true)}
            className="p-2 rounded-xl border border-theme-subtle hover:bg-theme-hover text-theme-primary/60 hover:text-theme-primary transition-all cursor-pointer"
            title="Bảng phím tắt (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto px-3 sm:px-6 py-4 flex flex-col items-center justify-between">
        
        <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-auto py-2">
          
          {isEditing ? (
            <ReviewEditForm 
              editForm={editForm}
              setEditForm={setEditForm}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="w-full flex flex-col items-center">
              
              {/* Flashcard Container */}
              <div 
                className="w-full relative group transition-all"
                style={{ perspective: 1200 }}
              >
                <div 
                  onClick={() => {
                    if (!(isFreeStudy && exerciseType !== 'flip')) {
                      setShowAnswer(!showAnswer);
                    }
                  }}
                  className={`w-full min-h-[440px] sm:min-h-[480px] max-h-[66vh] sm:max-h-[70vh] bg-theme-panel border border-theme-subtle rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden flex flex-col relative transition-all duration-300 ${
                    !(isFreeStudy && exerciseType !== 'flip') 
                      ? 'cursor-pointer hover:border-theme-accent/40' 
                      : ''
                  }`}
                >
                  
                  {/* Card Interior Header Tag */}
                  <div className="w-full px-6 pt-5 pb-3 flex items-center justify-between border-b border-theme-subtle/50 shrink-0 bg-theme-panel">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-theme-accent">
                        {showAnswer ? 'Mặt sau (Đáp án & Chi tiết)' : 'Mặt trước (Từ vựng)'}
                      </span>
                      {currentCard.wordType && (
                        <span className={getWordTypeBadgeStyle(currentCard.wordType, "text-[10px] px-2.5 py-0.5 rounded-full font-medium")}>
                          {currentCard.wordType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-theme-primary/60">
                      {isFreeStudy && (
                        <div className="flex items-center gap-1 mr-2">
                          {[0, 1, 2].map(i => (
                            <span 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full ${i < currentCardProgress ? 'bg-theme-accent' : 'bg-theme-subtle'}`} 
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-theme-accent font-bold">{safeIndex + 1}</span>
                      <span>/</span>
                      <span>{reviewQueue.length}</span>
                    </div>
                  </div>

                  {/* Scrollable Card Body */}
                  <div ref={cardContentRef} className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8 flex flex-col items-center justify-center">
                    
                    {!showAnswer ? (
                      /* Front View: Always 100% visible */
                      <div className="w-full flex-1 flex flex-col items-center justify-center text-center my-auto gap-6 py-4">
                        
                        {/* Hero Kanji / Word */}
                        <div className="flex flex-col items-center gap-3">
                          <h1 
                            className="text-6xl sm:text-7xl md:text-8xl font-serif text-theme-primary font-bold tracking-tight break-words max-w-full leading-tight select-text"
                            style={{ fontFamily: 'serif' }}
                          >
                            {primaryDisplayWord}
                          </h1>

                          {/* Sino-Vietnamese hint on front if available */}
                          {currentCard.sinoVietnamese && (
                            <div className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-xl">
                              <span>Âm Hán Việt:</span>
                              <strong className="tracking-widest">{currentCard.sinoVietnamese}</strong>
                            </div>
                          )}

                          {/* Audio Play Button */}
                          <div className="flex flex-col items-center gap-1.5 mt-2">
                            <button
                              type="button"
                              onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md ${
                                currentCard.audioUrl 
                                  ? 'bg-theme-accent text-theme-inverted hover:scale-105 shadow-theme-accent/20' 
                                  : 'bg-theme-hover border border-theme-subtle text-theme-primary hover:text-theme-accent hover:scale-105'
                              }`}
                              title={currentCard.audioUrl ? "Nghe phát âm chuẩn MP3" : "Nghe phát âm"}
                            >
                              <Volume2 className="w-7 h-7" />
                            </button>
                            {currentCard.audioUrl && (
                              <span className="text-[10px] font-extrabold text-theme-accent uppercase tracking-widest">
                                MP3 Chuẩn
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Flip instruction badge */}
                        {!(isFreeStudy && exerciseType !== 'flip') && (
                          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme-base-alt border border-theme-subtle text-theme-primary/70 text-xs">
                            <Repeat className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                            <span>Chạm vào thẻ hoặc nhấn <kbd className="font-mono bg-theme-panel px-1.5 py-0.5 rounded border border-theme-subtle text-theme-primary font-bold">Space</kbd> để xem đáp án</span>
                          </div>
                        )}

                        {isFreeStudy && exerciseType !== 'flip' && (
                          <div className="text-theme-accent text-xs font-bold uppercase tracking-widest mt-2">
                            {exerciseType === 'mcq_meaning' ? 'Chọn nghĩa đúng của từ bên dưới' : 'Nhập cách đọc Hiragana bên dưới'}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Back View: Detailed breakdown */
                      <div className="w-full flex flex-col items-center text-center gap-6 py-2">
                        
                        {/* Back Top: Kanji & Pronunciation Header */}
                        <div className="w-full flex flex-col items-center gap-3 pb-6 border-b border-theme-subtle/50">
                          
                          <div className="flex items-center justify-center gap-3 flex-wrap">
                            <h2 
                              className="text-4xl sm:text-6xl font-serif text-theme-primary font-bold tracking-tight"
                              style={{ fontFamily: 'serif' }}
                            >
                              {currentCard.kanji || currentCard.reading}
                            </h2>

                            <button
                              type="button"
                              onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                                currentCard.audioUrl 
                                  ? 'bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25' 
                                  : 'bg-theme-hover text-theme-primary/70 hover:text-theme-accent'
                              }`}
                              title="Phát âm lại từ vựng"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Reading & Romaji & Sino-Vietnamese */}
                          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-1">
                            {currentCard.reading && (
                              <div className="px-3.5 py-1.5 rounded-xl bg-theme-base-alt border border-theme-subtle text-lg sm:text-2xl font-serif text-theme-accent font-semibold tracking-wide">
                                {currentCard.reading}
                              </div>
                            )}

                            {currentCard.sinoVietnamese && (
                              <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs sm:text-sm uppercase tracking-wider font-extrabold">
                                Hán Việt: {currentCard.sinoVietnamese}
                              </div>
                            )}

                            {currentCard.romaji && (
                              <div className="text-xs sm:text-sm text-theme-primary/50 italic font-mono">
                                [{currentCard.romaji}]
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Primary Meaning */}
                        <div className="w-full flex flex-col items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-theme-accent/70">
                            Ý nghĩa chính
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-bold text-theme-primary tracking-tight leading-relaxed max-w-xl">
                            {currentCard.meaning}
                          </h3>
                        </div>

                        {/* Kanji Explanation & Memory Tips */}
                        {(currentCard.kanjiExplanation || currentCard.wordType) && (
                          <div className="w-full max-w-2xl bg-theme-base-alt/60 border border-theme-subtle/70 rounded-2xl p-4 sm:p-5 text-left text-sm text-theme-primary/90 leading-relaxed shadow-xs">
                            <div className="flex items-center gap-2 text-theme-accent text-xs font-bold uppercase tracking-wider mb-2">
                              <BookOpen className="w-4 h-4" />
                              <span>Giải thích &amp; Cách ghi nhớ</span>
                            </div>
                            <div className="markdown-body text-xs sm:text-sm leading-relaxed">
                              <Markdown>
                                {(currentCard.wordType ? `**Từ loại:** ${currentCard.wordType}\n\n` : "") + (currentCard.kanjiExplanation || "")}
                              </Markdown>
                            </div>
                          </div>
                        )}

                        {/* Conjugation Forms (if any) */}
                        {currentCard.forms && currentCard.forms.length > 0 && (
                          <div className="w-full max-w-2xl flex flex-col items-start gap-2 text-left">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-theme-primary/50 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-theme-accent" />
                              <span>Các dạng biến đổi (Forms)</span>
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                              {currentCard.forms.map((form, fIdx) => (
                                <div key={fIdx} className="p-2.5 rounded-xl bg-theme-base-alt border border-theme-subtle flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-[10px] text-theme-primary/50 truncate uppercase font-bold">{form.name || 'Dạng'}</div>
                                    <div className="text-xs font-serif font-bold text-theme-primary truncate">{form.value}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => handleSpeak(e, form.value, form.audioUrl)}
                                    className="p-1 rounded text-theme-primary/40 hover:text-theme-accent cursor-pointer shrink-0"
                                    title="Nghe dạng này"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Example Sentences */}
                        {((currentCard.examples && currentCard.examples.length > 0) || currentCard.example) && (
                          <div className="w-full max-w-2xl flex flex-col items-start gap-3 text-left pt-2">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-theme-primary/50 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
                              <span>Câu ví dụ thực tế trong bài</span>
                            </span>

                            <div className="flex flex-col gap-3 w-full">
                              {currentCard.examples && currentCard.examples.length > 0 ? (
                                currentCard.examples.map((ex) => {
                                  const isEditingExample = editingExampleId === ex.id;
                                  return (
                                    <HighlightProvider key={ex.id}>
                                      <div className="w-full p-4 sm:p-5 rounded-2xl bg-theme-base-alt border border-theme-subtle/80 flex flex-col gap-2.5 relative group/ex text-left shadow-xs">
                                        {isEditingExample ? (
                                          <div className="w-full flex flex-col gap-2.5">
                                            <input
                                              type="text"
                                              value={editExampleForm.sentence}
                                              onChange={e => setEditExampleForm({...editExampleForm, sentence: e.target.value})}
                                              className="w-full bg-theme-panel border border-theme-subtle rounded-xl p-2.5 text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-theme-accent"
                                              placeholder="Câu tiếng Nhật..."
                                            />
                                            <div className="flex gap-2">
                                              <input
                                                type="text"
                                                value={editExampleForm.reading || ''}
                                                onChange={e => setEditExampleForm({...editExampleForm, reading: e.target.value})}
                                                className="w-1/2 bg-theme-panel border border-theme-subtle rounded-xl p-2 text-xs text-theme-primary focus:outline-none focus:border-theme-accent"
                                                placeholder="Cách đọc Hiragana..."
                                              />
                                              <input
                                                type="text"
                                                value={editExampleForm.romaji || ''}
                                                onChange={e => setEditExampleForm({...editExampleForm, romaji: e.target.value})}
                                                className="w-1/2 bg-theme-panel border border-theme-subtle rounded-xl p-2 text-xs text-theme-primary focus:outline-none focus:border-theme-accent"
                                                placeholder="Romaji..."
                                              />
                                            </div>
                                            <textarea
                                              value={editExampleForm.translation || ''}
                                              onChange={e => setEditExampleForm({...editExampleForm, translation: e.target.value})}
                                              className="w-full bg-theme-panel border border-theme-subtle rounded-xl p-2 text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-theme-accent"
                                              placeholder="Nghĩa tiếng Việt..."
                                              rows={2}
                                            />
                                            <div className="flex justify-end gap-2 mt-1">
                                              <button
                                                onClick={() => setEditingExampleId(null)}
                                                className="px-3 py-1.5 text-xs text-theme-primary/60 hover:text-theme-primary"
                                              >
                                                Hủy
                                              </button>
                                              <button
                                                onClick={() => {
                                                  if (!onUpdateCard) return;
                                                  const updatedExamples = currentCard.examples!.map(e => 
                                                    e.id === ex.id ? { ...e, ...editExampleForm } : e
                                                  );
                                                  onUpdateCard(currentCard.id, { examples: updatedExamples });
                                                  setEditingExampleId(null);
                                                }}
                                                className="px-4 py-1.5 text-xs font-bold bg-theme-accent text-theme-inverted rounded-xl hover:brightness-110"
                                              >
                                                Lưu thay đổi
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="w-full flex items-start justify-between gap-3">
                                              <p className="text-base sm:text-lg text-theme-primary font-serif leading-relaxed break-words font-medium">
                                                {renderExampleHighlight(ex.sentence, currentCard.kanji || currentCard.reading, deck, currentCard)}
                                              </p>
                                              
                                              <div className="flex items-center gap-1 shrink-0 -mt-1">
                                                <button
                                                  type="button"
                                                  onClick={(e) => handleSpeak(e, ex.sentence, ex.audioUrl)}
                                                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    ex.audioUrl 
                                                      ? 'bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25' 
                                                      : 'text-theme-primary/40 hover:text-theme-accent'
                                                  }`}
                                                  title={ex.audioUrl ? "Nghe âm thanh MP3 câu ví dụ" : "Nghe câu ví dụ"}
                                                >
                                                  <Volume2 className="w-4 h-4" />
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setEditingExampleId(ex.id);
                                                    setEditExampleForm({
                                                      sentence: ex.sentence,
                                                      translation: ex.translation || "",
                                                      reading: ex.reading || "",
                                                      romaji: ex.romaji || ""
                                                    });
                                                  }}
                                                  className="p-2 rounded-xl text-theme-primary/30 hover:text-theme-primary hover:bg-theme-hover transition-colors cursor-pointer"
                                                  title="Chỉnh sửa câu ví dụ"
                                                >
                                                  <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {(ex.reading || ex.romaji) && (
                                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-theme-primary/60 font-serif">
                                                {ex.reading && <span className="italic"><RelatedHighlight text={ex.reading} type="hiragana" /></span>}
                                                {ex.romaji && <span className="opacity-60 italic"><RelatedHighlight text={ex.romaji} type="romaji" /></span>}
                                              </div>
                                            )}

                                            {ex.translation && (
                                              <p className="text-xs sm:text-sm text-theme-accent opacity-90 leading-relaxed pt-2 border-t border-theme-subtle/50">
                                                <HighlightVietnamese text={ex.translation} />
                                              </p>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </HighlightProvider>
                                  );
                                })
                              ) : (
                                /* Legacy single example fallback */
                                <HighlightProvider>
                                  <div className="w-full p-4 sm:p-5 rounded-2xl bg-theme-base-alt border border-theme-subtle/80 flex flex-col gap-2 relative text-left shadow-xs">
                                    {currentCard.example && (
                                      <div className="w-full flex items-start justify-between gap-3">
                                        <p className="text-base sm:text-lg text-theme-primary font-serif leading-relaxed break-words font-medium">
                                          {renderExampleHighlight(currentCard.example, currentCard.kanji || currentCard.reading, deck, currentCard)}
                                        </p>
                                        <button
                                          type="button"
                                          onClick={(e) => handleSpeak(e, currentCard.example!, currentCard.audioUrl)}
                                          className="p-2 rounded-xl text-theme-primary/40 hover:text-theme-accent cursor-pointer"
                                          title="Nghe câu ví dụ"
                                        >
                                          <Volume2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                    {currentCard.exampleTranslation && (
                                      <p className="text-xs sm:text-sm text-theme-accent opacity-90 leading-relaxed pt-2 border-t border-theme-subtle/50">
                                        <HighlightVietnamese text={currentCard.exampleTranslation} />
                                      </p>
                                    )}
                                  </div>
                                </HighlightProvider>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Response & Grading Actions */}
        <div className="shrink-0 w-full max-w-3xl pt-3 pb-2 z-20">
          {!showAnswer ? (
            isFreeStudy && exerciseType !== 'flip' ? (
              exerciseType === 'typing_reading' ? (
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="flex w-full gap-2 relative h-12">
                    <input 
                      type="text"
                      value={readingInput}
                      onChange={(e) => { setReadingInput(e.target.value); setInputError(false); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCheckReading(); }}
                      placeholder="Nhập Hiragana..."
                      className={`flex-1 bg-theme-panel border ${inputError ? 'border-red-500' : 'border-theme-accent/40 focus:border-theme-accent'} rounded-2xl text-theme-primary px-5 py-2 focus:outline-none text-center text-lg font-serif shadow-sm`}
                      autoFocus
                    />
                    <button 
                      onClick={handleCheckReading}
                      className="bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-6 rounded-2xl uppercase tracking-wider font-bold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      Kiểm tra
                    </button>
                  </div>
                  {inputError && (
                    <span className="text-red-500 text-xs font-medium">Đáp án chưa chính xác, hãy thử lại!</span>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    {mcqOptions.map((opt, i) => {
                      const isWrong = inputError && wrongMcqOption === opt;
                      return (
                        <button 
                          key={i}
                          onClick={() => handleMcqSelect(opt)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                            isWrong 
                              ? 'border-red-500 bg-red-500/15 text-red-400' 
                              : 'border-theme-subtle bg-theme-panel hover:border-theme-accent/60 hover:bg-theme-hover text-theme-primary'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full bg-theme-base-alt border border-theme-subtle flex items-center justify-center text-xs font-mono font-bold shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-xs sm:text-sm font-medium line-clamp-2">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {inputError && (
                    <span className="text-red-500 text-xs font-medium text-center">Đáp án chưa đúng, chọn lại nhé!</span>
                  )}
                </div>
              )
            ) : (
              /* Big Reveal Answer Button */
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-theme-accent via-amber-500 to-theme-accent hover:brightness-110 text-theme-inverted font-bold text-sm sm:text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-theme-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20"
              >
                <span>Lật thẻ xem đáp án</span>
                <span className="text-xs font-mono bg-black/20 text-theme-inverted px-2.5 py-1 rounded-xl font-bold">
                  Phím Space
                </span>
              </button>
            )
          ) : isFreeStudy ? (
            /* Free Study 2-button choice */
            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={handleFreeStudyForgot}
                className="py-4 px-4 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                  <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                  <span>Cần ôn lại</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20">1</kbd>
                </div>
                <span className="text-[11px] opacity-75">Sẽ lặp lại sớm trong phiên này</span>
              </button>

              <button 
                onClick={handleFreeStudyRemember}
                className="py-4 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Đã nhớ từ này</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20">2</kbd>
                </div>
                <span className="text-[11px] opacity-75">Ghi nhận tiến độ học nhồi</span>
              </button>
            </div>
          ) : (
            /* Standard SRS 4-Button Response Grid */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full">
              
              {/* Grade: Forgot (1) */}
              <button 
                onClick={() => handleGrade('forgot')}
                className="py-3 sm:py-3.5 px-3 rounded-2xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-500 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform" />
                  <span>Lặp lại</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20">1</kbd>
                </div>
                <span className="text-[10px] font-mono text-red-400/80">&lt; 10 phút</span>
              </button>

              {/* Grade: Hard (2) */}
              <button 
                onClick={() => handleGrade('hard')}
                className="py-3 sm:py-3.5 px-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-500 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <Flame className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Khó</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20">2</kbd>
                </div>
                <span className="text-[10px] font-mono text-amber-400/80">1 - 2 ngày</span>
              </button>

              {/* Grade: Good (3) */}
              <button 
                onClick={() => handleGrade('good')}
                className="py-3 sm:py-3.5 px-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Tốt</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20">3</kbd>
                </div>
                <span className="text-[10px] font-mono text-emerald-500/80">3 - 4 ngày</span>
              </button>

              {/* Grade: Easy (4) */}
              <button 
                onClick={() => handleGrade('easy')}
                className="py-3 sm:py-3.5 px-3 rounded-2xl border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/15 text-sky-500 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Rất dễ</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20">4</kbd>
                </div>
                <span className="text-[10px] font-mono text-sky-400/80">6 - 7 ngày</span>
              </button>

            </div>
          )}
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      {confirmingDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmingDeleteId(null)} />
          <div className="bg-theme-panel border border-theme-subtle rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-theme-primary">Xóa từ vựng này?</h3>
            <p className="text-sm text-theme-primary/70">
              Từ vựng này sẽ bị xóa khỏi kho học của bạn và không thể phục hồi.
            </p>
            <div className="flex items-center gap-3 justify-center mt-2">
              <button 
                onClick={() => setConfirmingDeleteId(null)} 
                className="px-5 py-2.5 rounded-xl border border-theme-subtle hover:bg-theme-hover text-theme-primary text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  if (confirmingDeleteId) {
                    onRemoveCard(confirmingDeleteId);
                    setReviewQueue(prev => prev.filter(c => c.id !== confirmingDeleteId));
                    setShowAnswer(false);
                  }
                  setConfirmingDeleteId(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcut Help Modal */}
      {showShortcutHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShortcutHelp(false)} />
          <div className="bg-theme-panel border border-theme-subtle rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-theme-accent" />
                <h3 className="font-serif font-bold text-theme-primary text-base">Phím tắt khi ôn tập</h3>
              </div>
              <button onClick={() => setShowShortcutHelp(false)} className="p-1 rounded text-theme-primary/50 hover:text-theme-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Lật thẻ xem đáp án</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold">Space / Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Đánh giá: Chưa nhớ / Lặp lại</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold text-red-500">1</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Đánh giá: Khó / Mơ hồ</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold text-amber-500">2</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Đánh giá: Tốt / Đã nhớ</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold text-emerald-500">3</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Đánh giá: Rất dễ</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold text-sky-500">4</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Nghe lại phát âm âm thanh</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold">R</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Chỉnh sửa nhanh thông tin từ</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold">E</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-theme-base-alt">
                <span className="text-theme-primary/80">Thoát phiên học</span>
                <kbd className="font-mono px-2 py-1 rounded bg-theme-panel border border-theme-subtle font-bold">Esc</kbd>
              </div>
            </div>

            <button 
              onClick={() => setShowShortcutHelp(false)}
              className="mt-2 w-full py-2.5 bg-theme-accent text-theme-inverted font-bold rounded-xl text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
