import Markdown from 'react-markdown';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, Eye, Pen, Lightbulb, Volume2 } from "lucide-react";
import { IntensiveExample, IntensiveWord, KanjiCard } from "../types";
import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";

interface SentenceReviewProps {
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  mode: "JA_TO_VI" | "VI_TO_JA";
  forceAll?: boolean;
  onClose: () => void;
  onUpdateWord?: (id: string, updates: Partial<IntensiveWord>) => void;
  onRecordReview?: (isCorrect: boolean) => void;
}

interface ExampleWithWord extends IntensiveExample {
  word: string;
  wordId: string;
}

export const SentenceReview: React.FC<SentenceReviewProps> = ({
  deck,
  mainDeck,
  mode,
  forceAll,
  onClose,
  onUpdateWord,
  onRecordReview,
}) => {
  const [examples, setExamples] = useState<ExampleWithWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedState, setFlippedState] = useState<Record<number, boolean>>({});
  const showAnswer = flippedState[currentIndex] || false;
  const setShowAnswer = (val: boolean) => setFlippedState(prev => ({ ...prev, [currentIndex]: val }));
  const [isInitialized, setIsInitialized] = useState(false);

  const handleTTS = (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    sentence: "",
    reading: "",
    romaji: "",
    translation: "",
  });

  useEffect(() => {
    if (isInitialized) return;

    // Extract all examples from the deck
    const allExamples: ExampleWithWord[] = [];
    deck.forEach((word) => {
      word.examples.forEach((ex) => {
        if (ex.sentence && ex.translation) {
          allExamples.push({ ...ex, word: word.word, wordId: word.id });
        }
      });
    });

    const now = Date.now();
    const dueExamples = forceAll ? allExamples : allExamples.filter((ex) => {
      const isMastered =
        mode === "VI_TO_JA"
          ? (ex.viToJaMastered ?? ex.mastered)
          : (ex.jaToViMastered ?? ex.mastered);
      if (!isMastered) return true; // always show unmastered (Chưa nhớ)

      const nextReviewDate =
        mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
      if (!nextReviewDate) return true; // show if mastered but no review date set

      return nextReviewDate <= now;
    });

    // Shuffle examples to randomize (both unmastered and due mastered)
    for (let i = dueExamples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dueExamples[i], dueExamples[j]] = [dueExamples[j], dueExamples[i]];
    }

    // Sort by priority to ensure new and forgotten sentences appear first
    dueExamples.sort((a, b) => {
      const getPriority = (ex: ExampleWithWord) => {
        const interval = mode === "VI_TO_JA" ? ex.viToJaInterval : ex.jaToViInterval;
        if (interval === undefined || interval === null) return 0; // Chưa học (New)
        if (interval === 0) return 1; // Quên (Forgot)
        return 2; // Đến hạn ôn (Due)
      };
      return getPriority(a) - getPriority(b);
    });

    setExamples(dueExamples);
    setIsInitialized(true);
  }, [deck, mode, isInitialized]);

  if (examples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <p className="text-theme-primary/60 mb-6 font-serif text-lg">
          Chưa có câu ví dụ nào trong Chuyên đề.
        </p>
        <button
          onClick={onClose}
          className="border border-theme-subtle hover:border-theme-accent text-theme-accent bg-theme-panel px-8 py-3 rounded-none uppercase tracking-[0.2em] text-xs transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const currentExample = examples[currentIndex];

  const questionText =
    mode === "JA_TO_VI" ? currentExample.sentence : currentExample.translation;
  const answerText =
    mode === "JA_TO_VI" ? currentExample.translation : currentExample.sentence;

  const handleNext = () => {
    // do not mutate the old index so it stays flipped during exit
    if (currentIndex < examples.length - 1) {
      setCurrentIndex((prev) => { setFlippedState(fs => ({ ...fs, [prev + 1]: false })); return prev + 1; });
    } else {
      setFlippedState(fs => ({ ...fs, [0]: false })); setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setShowAnswer(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleGrade = (grade: 'forgot' | 'hard' | 'good') => {
    if (onRecordReview) {
      onRecordReview(grade !== 'forgot');
    }

    if (onUpdateWord) {
      const word = deck.find((w) => w.id === currentExample.wordId);
      if (word) {
        const updatedExamples = word.examples.map((ex) => {
          if (ex.id === currentExample.id) {
            // Calculate Spaced Repetition values using SM-2
            const currentInterval = mode === "VI_TO_JA" ? (ex.viToJaInterval || 0) : (ex.jaToViInterval || 0);
            const currentFailCount = mode === "VI_TO_JA" ? (ex.viToJaFailCount || 0) : (ex.jaToViFailCount || 0);
            const currentRepetition = mode === "VI_TO_JA" ? (ex.viToJaRepetition || 0) : (ex.jaToViRepetition || 0);
            const currentEaseFactor = mode === "VI_TO_JA" ? (ex.viToJaEaseFactor || 2.5) : (ex.jaToViEaseFactor || 2.5);

            let nextInterval = currentInterval;
            let nextRepetition = currentRepetition;
            let nextEaseFactor = currentEaseFactor;
            let sm2Quality = 0;
            
            if (grade === 'forgot') sm2Quality = 1;
            if (grade === 'hard') sm2Quality = 3;
            if (grade === 'good') sm2Quality = 4;
            
            if (sm2Quality >= 3) {
              if (nextRepetition === 0) {
                nextInterval = 1;
              } else if (nextRepetition === 1) {
                nextInterval = 6;
              } else {
                nextInterval = Math.round(nextInterval * nextEaseFactor);
              }
              nextRepetition++;
            } else {
              nextRepetition = 0;
              nextInterval = 1;
            }
            
            if (grade === 'forgot') {
               nextInterval = 0; // Học lại ngay
            }

            nextEaseFactor = nextEaseFactor + (0.1 - (5 - sm2Quality) * (0.08 + (5 - sm2Quality) * 0.02));
            if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

            let nextReviewDate = Date.now();
            let newFailCount = currentFailCount;
            let isMastered = false;

            if (grade === 'good') {
              isMastered = true;
            } else {
              newFailCount += 1;
            }

            if (nextInterval > 0) {
              nextReviewDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
            }

            return mode === "VI_TO_JA"
              ? {
                  ...ex,
                  viToJaMastered: isMastered,
                  viToJaInterval: nextInterval,
                  viToJaNextReviewDate: nextReviewDate,
                  viToJaFailCount: newFailCount,
                  viToJaRepetition: nextRepetition,
                  viToJaEaseFactor: nextEaseFactor
                }
              : {
                  ...ex,
                  jaToViMastered: isMastered,
                  jaToViInterval: nextInterval,
                  jaToViNextReviewDate: nextReviewDate,
                  jaToViFailCount: newFailCount,
                  jaToViRepetition: nextRepetition,
                  jaToViEaseFactor: nextEaseFactor
                };
          }
          return ex;
        });
        onUpdateWord(word.id, { examples: updatedExamples });
      }
    }

    // Update local state to reflect the change immediately
    setExamples((prev) =>
      prev.map((ex, i) => {
        if (i === currentIndex) {
          const currentInterval = mode === "VI_TO_JA" ? ex.viToJaInterval : ex.jaToViInterval;
          const currentFailCount = mode === "VI_TO_JA" ? (ex.viToJaFailCount || 0) : (ex.jaToViFailCount || 0);

          let nextInterval = 0;
          let nextReviewDate = Date.now();
          let newFailCount = currentFailCount;
          let isMastered = false;

          if (grade === 'good') {
            nextInterval = (!currentInterval || currentInterval === 0) ? 1 : 
                           (currentInterval === 1 ? 3 : 
                           (currentInterval === 3 ? 7 : currentInterval * 2));
            isMastered = true;
          } else if (grade === 'hard') {
            nextInterval = 1;
            newFailCount += 1;
            isMastered = false;
          } else if (grade === 'forgot') {
            nextInterval = 0;
            isMastered = false;
          }

          if (nextInterval > 0) {
            nextReviewDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
          }

          return mode === "VI_TO_JA"
            ? {
                ...ex,
                viToJaMastered: isMastered,
                viToJaInterval: nextInterval,
                viToJaNextReviewDate: nextReviewDate,
                viToJaFailCount: newFailCount
              }
            : {
                ...ex,
                jaToViMastered: isMastered,
                jaToViInterval: nextInterval,
                jaToViNextReviewDate: nextReviewDate,
                jaToViFailCount: newFailCount
              };
        }
        return ex;
      }),
    );

    handleNext();
  };

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleStartEdit = () => {
    const currentExample = examples[currentIndex];
    setEditData({
      sentence: currentExample.sentence,
      reading: currentExample.reading || "",
      romaji: currentExample.romaji || "",
      translation: currentExample.translation || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(editData.sentence || "").trim()) return;

    const currentExample = examples[currentIndex];

    if (onUpdateWord) {
      const word = deck.find((w) => w.id === currentExample.wordId);
      if (word) {
        const updatedExamples = word.examples.map((ex) => {
          if (ex.id === currentExample.id) {
            return {
              ...ex,
              sentence: String(editData.sentence || "").trim(),
              reading: String(editData.reading || "").trim(),
              romaji: String(editData.romaji || "").trim(),
              translation: String(editData.translation || "").trim(),
            };
          }
          return ex;
        });
        onUpdateWord(word.id, { examples: updatedExamples });
      }
    }

    setExamples((prev) =>
      prev.map((ex, i) => {
        if (i === currentIndex) {
          return {
            ...ex,
            sentence: String(editData.sentence || "").trim(),
            reading: String(editData.reading || "").trim(),
            romaji: String(editData.romaji || "").trim(),
            translation: String(editData.translation || "").trim(),
          };
        }
        return ex;
      }),
    );

    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-2 sm:px-4">
      <div className="flex items-center justify-between p-4 border-b border-theme-subtle">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-theme-primary/60 hover:text-theme-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-theme-accent">
              Ôn tập câu:{" "}
              {mode === "JA_TO_VI" ? "Nhật -> Việt" : "Việt -> Nhật"}
            </h2>
            <p className="text-xs text-theme-primary/50 mt-1">
              Câu {currentIndex + 1} / {examples.length}{" "}
              <span className="opacity-70">
                ({examples.length - currentIndex - 1} câu nữa)
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full h-1 bg-theme-subtle">
        <div
          className="h-full bg-theme-accent transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / examples.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl"
          >
            
  
  <div className="w-full relative min-h-[400px] mb-8" style={{ perspective: "1000px" }}>
    <motion.div
      className="w-full h-full absolute inset-0 cursor-pointer"
      onClick={(e) => {
        // Prevent click if clicking on a button or link or form inside
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('form')) {
           return;
        }
        if (showAnswer) return;
        setShowAnswer(true);
      }}
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateY: showAnswer ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 20 }}
    >
      {/* Front */}
      <div 
        className={`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center group overflow-y-auto ${showAnswer ? 'pointer-events-none' : ''}`}
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      >
        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "NHẬT" : "VIỆT"}
        </span>
        
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="absolute top-4 right-4 text-theme-primary/40 hover:text-theme-accent transition-colors p-2"
            title="Sửa ví dụ"
          >
            <Pen className="w-4 h-4" />
          </button>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="w-full text-left space-y-4 mt-8">
            <h4 className="text-xs uppercase tracking-wider text-theme-accent mb-4 font-medium">Chỉnh sửa câu ví dụ</h4>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Câu ví dụ (Nhật) *</label>
              <textarea required rows={2} value={editData.sentence} onChange={(e) => setEditData({ ...editData, sentence: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent text-theme-japanese font-serif resize-none" placeholder="Nhập câu tiếng Nhật..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Cách đọc (Hiragana)</label>
                <input type="text" value={editData.reading} onChange={(e) => setEditData({ ...editData, reading: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent" placeholder="VD: わたし..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Romaji</label>
                <input type="text" value={editData.romaji} onChange={(e) => setEditData({ ...editData, romaji: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent font-mono" placeholder="VD: watashi..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Nghĩa tiếng Việt</label>
              <textarea rows={2} value={editData.translation} onChange={(e) => setEditData({ ...editData, translation: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent resize-none" placeholder="Nhập nghĩa tiếng Việt..." />
            </div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={handleCancelEdit} className="flex-1 px-4 py-3 text-xs tracking-widest uppercase font-bold border border-theme-subtle text-theme-primary/60 hover:bg-theme-subtle/50 transition-colors">Hủy</button>
              <button type="submit" className="flex-1 px-4 py-3 text-xs tracking-widest uppercase font-bold bg-theme-accent text-theme-inverted hover:bg-theme-accent-hover transition-colors">Lưu thay đổi</button>
            </div>
          </form>
        ) : (
          <> <div className="flex-1 shrink-0 min-h-0" /> <HighlightProvider>
            <div className="w-full shrink-0 my-4">
              <p
                className={`font-serif leading-relaxed whitespace-pre-wrap ${mode === "JA_TO_VI" ? "text-theme-japanese text-2xl sm:text-3xl" : "text-theme-primary text-xl sm:text-2xl"}`}
              >
                {mode === "JA_TO_VI"
                  ? renderExampleHighlight(
                      currentExample.sentence,
                      currentExample.word,
                      mainDeck,
                    )
                  : <HighlightVietnamese text={questionText} />}
              </p>
              {mode === "JA_TO_VI" && currentExample.reading && (
                <p className="text-theme-accent opacity-80 mt-4 text-sm">
                  <RelatedHighlight text={currentExample.reading} type="hiragana" />
                </p>
              )}
            </div>
          </HighlightProvider> <div className="flex-1 shrink-0 min-h-0" /> </>
        )}
      </div>

      {/* Back */}
      <div 
        className={`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center group overflow-y-auto ${!showAnswer ? 'pointer-events-none' : ''}`}
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
        </span>
        <> <div className="flex-1 shrink-0 min-h-0" /> <HighlightProvider>
          <div className="w-full shrink-0 flex flex-col items-center justify-center min-h-[150px] my-4">
            {mode === "JA_TO_VI" && (
              <div className="mb-6 text-theme-primary/70">
                <p className="font-serif text-theme-japanese text-lg sm:text-xl mb-2">
                  {renderExampleHighlight(currentExample.sentence, currentExample.word, mainDeck)}
                </p>
                {currentExample.reading && (
                  <p className="text-theme-primary/80 text-sm">
                    <RelatedHighlight text={currentExample.reading} type="hiragana" />
                  </p>
                )}
              </div>
            )}
            {mode === "VI_TO_JA" && (
              <div className="mb-6 text-theme-primary/70">
                <p className="font-serif text-theme-primary text-lg sm:text-xl mb-2">
                  {currentExample.translation}
                </p>
              </div>
            )}
            <span className="text-xs font-mono text-theme-accent/30 mb-4 block uppercase">
              {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
            </span>
            <div className="flex flex-col items-center gap-3">
              <p
                className={`font-serif leading-relaxed whitespace-pre-wrap ${mode === "VI_TO_JA" ? "text-theme-japanese text-2xl sm:text-3xl" : "text-theme-accent text-xl sm:text-2xl"}`}
              >
                {mode === "VI_TO_JA"
                  ? renderExampleHighlight(
                      currentExample.sentence,
                      currentExample.word,
                      mainDeck,
                    )
                  : <HighlightVietnamese text={answerText} />}
              </p>
              {mode === "VI_TO_JA" && (
                <button
                  type="button"
                  onClick={(e) => handleTTS(currentExample.sentence, e)}
                  className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors mt-2"
                  title="Phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
            {mode === "VI_TO_JA" && currentExample.reading && (
              <p className="text-theme-primary/60 mt-4 text-sm">
                <RelatedHighlight text={currentExample.reading} type="hiragana" />
              </p>
            )}
            {currentExample.romaji && (
              <p className="text-theme-primary/40 mt-2 text-xs">
                <RelatedHighlight text={currentExample.romaji} type="romaji" />
              </p>
            )}
            {currentExample.specialNote && (
              <div className="mt-6 mx-auto max-w-lg p-5 bg-theme-accent/5 border-l-4 border-theme-accent rounded-r-lg relative text-left w-full">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lightbulb className="w-12 h-12 text-theme-accent" />
                </div>
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <Lightbulb className="w-4 h-4 text-theme-accent" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                    Lưu ý đặc biệt
                  </h4>
                </div>
                <div className="relative z-10 text-[15px] text-theme-primary/80 leading-relaxed font-serif markdown-body">
                  <Markdown>{currentExample.specialNote}</Markdown>
                </div>
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-theme-subtle/50 text-xs text-theme-primary/40 flex gap-2 items-center justify-center w-full">
              <span>Từ vựng gốc:</span>
              <strong className="text-theme-primary/70 font-serif text-sm">
                {currentExample.word}
              </strong>
              {(() => {
                const isMastered =
                  mode === "VI_TO_JA"
                    ? currentExample.viToJaMastered
                    : currentExample.jaToViMastered;
                const finalIsMastered =
                  isMastered !== undefined
                    ? isMastered
                    : currentExample.mastered;

                if (finalIsMastered !== undefined) {
                  return (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${finalIsMastered ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}
                    >
                      {finalIsMastered
                        ? mode === "VI_TO_JA"
                          ? "Nói được"
                          : "Đã nhớ"
                        : mode === "VI_TO_JA"
                          ? "Chưa nói được"
                          : "Chưa nhớ"}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </HighlightProvider> <div className="flex-1 shrink-0 min-h-0" /> </>
      </div>
    </motion.div>
  </div>
</motion.div>
</AnimatePresence>
{!isEditing && (
<div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">
{showAnswer ? (
              <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 max-w-[500px]">
                <button
                  onClick={() => handleGrade('forgot')}
                  className="border border-red-500/50 text-red-500 bg-theme-panel hover:bg-red-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1"
                >
                  <span className="uppercase tracking-widest text-[9px] opacity-70">{mode === "VI_TO_JA" ? "Quên sạch" : "Quên sạch"}</span>
                  <span className="text-xs">Lại từ đầu</span>
                </button>
                <button
                  onClick={() => handleGrade('hard')}
                  className="border border-orange-500/50 text-orange-500 bg-theme-panel hover:bg-orange-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1"
                >
                  <span className="uppercase tracking-widest text-[9px] opacity-70">{mode === "VI_TO_JA" ? "Đã học" : "Đã học"}</span>
                  <span className="text-xs">{mode === "VI_TO_JA" ? "Chưa nói được" : "Chưa nhớ"}</span>
                </button>
                <button
                  onClick={() => handleGrade('good')}
                  className="border border-green-500 text-green-500 bg-theme-panel hover:bg-green-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1"
                >
                  <span className="uppercase tracking-widest text-[9px] opacity-70">{mode === "VI_TO_JA" ? "Trôi chảy" : "Ghi nhớ"}</span>
                  <span className="text-xs">{mode === "VI_TO_JA" ? "Nói được" : "Đã nhớ"}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={showAnswer ? handleNext : handleReveal}
                className="flex-1 max-w-[200px] border border-theme-accent text-theme-inverted bg-theme-accent hover:bg-theme-accent-hover font-bold py-4 transition-colors uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2"
              >
                {showAnswer ? (
                  <>
                    Tiếp theo <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Xem đáp án
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleNext}
              className="p-4 border border-theme-subtle text-theme-primary/60 hover:text-theme-primary hover:border-theme-accent transition-colors bg-theme-panel"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
