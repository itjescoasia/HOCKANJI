import { usePersistentState } from '../hooks/usePersistentState';
import { playTTS, playAudioUrl } from '../utils/playTTS';
import localforage from 'localforage';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Markdown from 'react-markdown';
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, Eye, Pen, Lightbulb, Volume2, Copy, Shuffle, Check, Trophy, RotateCcw, Sparkles } from "lucide-react";
import { IntensiveExample, IntensiveWord, KanjiCard, FuriganaMode } from "../types";
import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";
import { FuriganaSentence, FuriganaToggle } from "./FuriganaSentence";
import { fetchFuriganaWithGemini } from "../utils/furigana";

interface SentenceReviewProps {
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  mode: "JA_TO_VI" | "VI_TO_JA";
  forceAll?: boolean;
  isRandom?: boolean;
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
  isRandom = false,
  onClose,
  onUpdateWord,
  onRecordReview,
}) => {
  const [examples, setExamples] = useState<ExampleWithWord[]>([]);
  const [currentIndexRaw, setCurrentIndex] = usePersistentState('app_sentencereview_currentIndex', 0);
  const [flippedState, setFlippedState] = usePersistentState<Record<number, boolean>>('app_sentencereview_flippedState', {});
  
  // Dedicated state for random review session so it does not collide with persistent SRS progress
  const [randomCurrentIndex, setRandomCurrentIndex] = useState(0);
  const [randomFlipped, setRandomFlipped] = useState(false);
  const [userTranslation, setUserTranslation] = useState("");
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const currentIndex = isRandom
    ? (examples.length > 0 ? Math.min(randomCurrentIndex, examples.length - 1) : 0)
    : (examples.length > 0 ? Math.min(currentIndexRaw, examples.length - 1) : 0);

  const showAnswer = isRandom ? randomFlipped : (flippedState[currentIndex] || false);
  const setShowAnswer = (val: boolean) => {
    if (isRandom) {
      setRandomFlipped(val);
    } else {
      setFlippedState(prev => ({ ...prev, [currentIndex]: val }));
    }
  };
  const [isInitialized, setIsInitialized] = useState(false);



  const handleTTS = async (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Check if we have an example with audio
    const currentExample = examples[currentIndex];
    
    if (currentExample && (currentExample.audioUrl || currentExample.hasAudio)) {
        try {
            let urlToPlay = null;
            if (currentExample.audioUrl) {
                if (currentExample.audioUrl.startsWith('firestore:') && auth.currentUser) {
                    const audioId = currentExample.audioUrl.split(':')[1];
                    const docSnap = await getDoc(doc(db, 'global_audio', audioId));
                    if (docSnap.exists()) {
                        urlToPlay = docSnap.data().data;
                    }
                } else {
                    urlToPlay = currentExample.audioUrl;
                }
            } else if (currentExample.hasAudio) {
                const blob = await localforage.getItem<Blob>(`audio_intensive_${currentExample.wordId}_${currentExample.id}`);
                if (blob) {
                    urlToPlay = URL.createObjectURL(blob);
                }
            }
            
            if (urlToPlay) {
                playAudioUrl(urlToPlay, text || currentExample?.sentence);
                return;
            }
        } catch (err) {
            console.error("Failed to load/play audio", err);
        }
    }
    
    playTTS(text);
  };
  
  const [furiganaMode, setFuriganaMode] = usePersistentState<FuriganaMode>('app_furigana_mode', 'always');
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingFurigana, setIsGeneratingFurigana] = useState(false);
  const [editData, setEditData] = useState({
    sentence: "",
    furigana: "",
    reading: "",
    romaji: "",
    translation: "",
  });

  const handleGenerateAIFurigana = async () => {
    if (!editData.sentence.trim()) return;
    try {
      setIsGeneratingFurigana(true);
      const res = await fetchFuriganaWithGemini(editData.sentence);
      if (res.furigana) {
        setEditData(prev => ({
          ...prev,
          furigana: res.furigana,
          reading: (!prev.reading && res.reading) ? res.reading : prev.reading
        }));
      }
    } catch (err: any) {
      alert('Không thể tạo Furigana bằng Gemini AI: ' + (err.message || 'Lỗi mạng'));
    } finally {
      setIsGeneratingFurigana(false);
    }
  };

  useEffect(() => {
    const handleTTSGenerated = (e: any) => {
      const { text, audioUrl } = e.detail;
      if (!text || !audioUrl) return;
      
      setExamples(prev => prev.map(ex => {
        if (ex.sentence === text && ex.audioUrl !== audioUrl) {
          return { ...ex, audioUrl, hasAudio: true };
        }
        return ex;
      }));
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, []);

  const initExamples = useCallback(() => {
    // Extract all examples from the deck
    const allExamples: ExampleWithWord[] = [];
    deck.forEach((word) => {
      (word.examples || []).forEach((ex) => {
        if (ex.sentence && ex.translation) {
          allExamples.push({ ...ex, word: word.word, wordId: word.id });
        }
      });
    });

    // If reviewing generally without a specific single-word restriction, also pull examples from mainDeck
    if (mainDeck && deck.length > 1) {
      mainDeck.forEach((card) => {
        if (card.examples && Array.isArray(card.examples)) {
          card.examples.forEach((ex) => {
            if (ex.sentence && ex.translation && !allExamples.some(e => e.sentence === ex.sentence)) {
              allExamples.push({
                id: ex.id || crypto.randomUUID(),
                sentence: ex.sentence,
                reading: ex.reading || '',
                romaji: ex.romaji || '',
                translation: ex.translation,
                audioUrl: ex.audioUrl,
                hasAudio: ex.hasAudio,
                word: card.kanji || card.reading,
                wordId: card.id,
              });
            }
          });
        } else if (card.example && card.exampleTranslation && !allExamples.some(e => e.sentence === card.example)) {
          allExamples.push({
            id: `card_${card.id}`,
            sentence: card.example,
            reading: card.reading || '',
            romaji: card.romaji || '',
            translation: card.exampleTranslation,
            audioUrl: card.audioUrl,
            hasAudio: card.hasAudio,
            word: card.kanji || card.reading,
            wordId: card.id,
          });
        }
      });
    }

    if (isRandom) {
      // Pure random shuffle across all available example sentences
      const shuffled = [...allExamples];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setExamples(shuffled);
      setRandomCurrentIndex(0);
      setRandomFlipped(false);
      setUserTranslation("");
      setSessionStats({ correct: 0, wrong: 0, total: 0 });
      setIsSessionFinished(false);
      setIsInitialized(true);
      return;
    }

    const now = Date.now();
    const dueExamples = forceAll ? allExamples : allExamples.filter((ex) => {
      const nextReviewDate =
        mode === "VI_TO_JA" ? ex.viToJaNextReviewDate : ex.jaToViNextReviewDate;
      
      // Nếu chưa từng học (chưa có nextReviewDate), thì hiển thị để học mới
      if (!nextReviewDate) return true; 

      // Nếu đã có nextReviewDate, chỉ hiển thị khi đã đến hạn (<= now)
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
  }, [deck, mainDeck, mode, forceAll, isRandom]);

  useEffect(() => {
    if (!isInitialized) {
      initExamples();
    }
  }, [isInitialized, initExamples]);

  const handleNext = () => {
    if (isRandom) {
      if (randomCurrentIndex < examples.length - 1) {
        setRandomFlipped(false);
        setRandomCurrentIndex(prev => prev + 1);
        setUserTranslation("");
      } else {
        setIsSessionFinished(true);
      }
      return;
    }
    // do not mutate the old index so it stays flipped during exit
    if (currentIndex < examples.length - 1) {
      setCurrentIndex((prev) => { setFlippedState(fs => ({ ...fs, [prev + 1]: false })); return prev + 1; });
    } else {
      setFlippedState(fs => ({ ...fs, [0]: false })); setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setShowAnswer(false);
    if (isRandom) {
      if (randomCurrentIndex > 0) {
        setRandomCurrentIndex(prev => prev - 1);
        setUserTranslation("");
      }
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleConfirmResult = (isCorrect: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
      total: prev.total + 1
    }));
    handleGrade(isCorrect ? 'good' : 'forgot');
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
            const currentIsMastered = mode === "VI_TO_JA" ? ex.viToJaMastered : ex.jaToViMastered;
            let isMastered = currentIsMastered || false;
            if (grade === 'good') {
              isMastered = true;
            } else if (grade === 'forgot') {
              newFailCount += 1;
              isMastered = false;
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
        const oldScore = word.reviewScore || 0;
        let scoreDelta = 0;
        if (grade === 'good') scoreDelta = 1;
        else if (grade === 'hard') scoreDelta = -1;
        else if (grade === 'forgot') scoreDelta = -2;
        const newScore = Math.max(0, oldScore + scoreDelta);
        onUpdateWord(word.id, { examples: updatedExamples, reviewScore: newScore });
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
          const currentIsMastered = mode === "VI_TO_JA" ? ex.viToJaMastered : ex.jaToViMastered;
          let isMastered = currentIsMastered || false;
          if (grade === 'good') {
            nextInterval = (!currentInterval || currentInterval === 0) ? 1 :
                            (currentInterval === 1 ? 3 :
                            (currentInterval === 3 ? 7 : currentInterval * 2));
            isMastered = true;
          } else if (grade === 'hard') {
            nextInterval = 1;
            newFailCount += 1;
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
      furigana: currentExample.furigana || "",
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
              furigana: String(editData.furigana || "").trim(),
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
            furigana: String(editData.furigana || "").trim(),
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

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;

      const activeEl = document.activeElement;
      const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      // If user is inside the textarea and presses Ctrl+Enter or Cmd+Enter: flip card
      if (isInputActive && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setShowAnswer(true);
        (activeEl as HTMLElement).blur();
        return;
      }

      // If typing normally in textarea/input, don't trigger global review hotkeys
      if (isInputActive) return;

      if (!showAnswer) {
        // Front face: Space or Enter flips to back
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setShowAnswer(true);
        }
      } else {
        // Back face:
        if (isRandom) {
          if (e.key === '1' || e.key === 'ArrowLeft') {
            e.preventDefault();
            handleConfirmResult(false);
          } else if (e.key === '2' || e.key === 'ArrowRight') {
            e.preventDefault();
            handleConfirmResult(true);
          }
        } else {
          if (e.key === '1') {
            e.preventDefault();
            handleGrade('forgot');
          } else if (e.key === '2') {
            e.preventDefault();
            handleGrade('hard');
          } else if (e.key === '3') {
            e.preventDefault();
            handleGrade('good');
          }
        }
      }

      // Press 'r' or 'R' to play audio
      if (e.key === 'r' || e.key === 'R') {
        const cur = examples[currentIndex];
        if (cur) {
          handleTTS(cur.sentence);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, isEditing, currentIndex, examples, isRandom]);

  if (isSessionFinished) {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-6 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-theme-accent/15 border border-theme-accent/30 flex items-center justify-center mb-6 text-theme-accent shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-theme-primary mb-2">
          Hoàn thành phiên ôn tập!
        </h2>
        <p className="text-theme-primary/60 text-sm mb-6 uppercase tracking-wider font-medium">
          {mode === "JA_TO_VI" ? "Ngẫu nhiên: Nhật → Việt" : "Ngẫu nhiên: Việt → Nhật"}
        </p>

        <div className="grid grid-cols-3 gap-3 w-full bg-theme-panel border border-theme-subtle p-6 rounded-xl mb-8 shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-theme-primary">{sessionStats.total}</span>
            <span className="text-[11px] text-theme-primary/60 uppercase tracking-wider mt-1">Đã ôn</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-emerald-500">{sessionStats.correct}</span>
            <span className="text-[11px] text-emerald-500/80 uppercase tracking-wider mt-1">Dịch đúng</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-red-500">{sessionStats.wrong}</span>
            <span className="text-[11px] text-red-500/80 uppercase tracking-wider mt-1">Dịch sai</span>
          </div>
        </div>

        <div className="text-sm text-theme-primary/80 mb-8 font-medium">
          Độ chính xác: <span className="text-theme-accent text-xl font-bold ml-1">{accuracy}%</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={initExamples}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-theme-accent text-theme-inverted font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-theme-accent-hover transition-colors shadow-sm cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Ôn lại ngẫu nhiên</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-6 border border-theme-subtle text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover font-bold uppercase tracking-widest text-xs rounded-lg transition-colors cursor-pointer"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
        <p className="text-theme-primary/60 mb-6 font-serif text-lg">
          {deck.some((word) => (word.examples || []).length > 0)
            ? "Tuyệt vời, bạn đã hoàn thành hết các câu đến hạn!"
            : "Chưa có câu ví dụ nào trong dữ liệu để ôn tập."}
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-2 sm:px-4">
      <div className="flex items-center justify-between p-4 border-b border-theme-subtle">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-theme-primary/60 hover:text-theme-primary transition-colors cursor-pointer"
            title="Đóng ôn tập"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-widest uppercase text-theme-accent">
                {isRandom ? "Ôn tập ngẫu nhiên: " : "Ôn tập câu: "}
                {mode === "JA_TO_VI" ? "Nhật → Việt" : "Việt → Nhật"}
              </h2>
              {isRandom && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-theme-accent/15 text-theme-accent border border-theme-accent/30 flex items-center gap-1">
                  <Shuffle className="w-2.5 h-2.5" />
                  Ngẫu nhiên
                </span>
              )}
            </div>
            <p className="text-xs text-theme-primary/50 mt-0.5">
              Câu {currentIndex + 1} / {examples.length}{" "}
              <span className="opacity-70">
                ({examples.length - currentIndex - 1} câu còn lại)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FuriganaToggle mode={furiganaMode} onChange={setFuriganaMode} />

          {isRandom && sessionStats.total > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1 bg-theme-panel border border-theme-subtle rounded-md">
              <span className="text-emerald-500 font-bold">Đúng: {sessionStats.correct}</span>
              <span className="text-theme-primary/30">|</span>
              <span className="text-red-500 font-bold">Sai: {sessionStats.wrong}</span>
            </div>
          )}

          {isRandom && (
            <button
              onClick={initExamples}
              title="Xáo trộn lại toàn bộ câu ngẫu nhiên"
              className="px-2.5 py-1.5 text-xs text-theme-primary/70 hover:text-theme-accent border border-theme-subtle hover:border-theme-accent bg-theme-panel rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider">Xáo trộn lại</span>
            </button>
          )}
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
      className="w-full h-full absolute inset-0"
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
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Câu ví dụ (Nhật) *</label>
                <button
                  type="button"
                  onClick={handleGenerateAIFurigana}
                  disabled={isGeneratingFurigana || !editData.sentence.trim()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20 rounded border border-theme-accent/30 transition-all disabled:opacity-50 cursor-pointer"
                  title="Dùng Gemini AI để phân tích và tự động điền Furigana theo ngữ cảnh"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingFurigana ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingFurigana ? "Đang tạo Furigana..." : "✨ Tạo Furigana bằng AI"}</span>
                </button>
              </div>
              <textarea required rows={2} value={editData.sentence} onChange={(e) => setEditData({ ...editData, sentence: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent text-theme-japanese font-serif resize-none" placeholder="Nhập câu tiếng Nhật..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium flex items-center justify-between">
                <span>Furigana (Định dạng: 漢字[かんじ])</span>
                <span className="text-[10px] text-theme-accent lowercase font-normal">Tự động sinh hoặc gõ thủ công</span>
              </label>
              <input
                type="text"
                value={editData.furigana || ""}
                onChange={(e) => setEditData({ ...editData, furigana: e.target.value })}
                className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent text-theme-japanese font-serif"
                placeholder="VD: 彼女[かのじょ]は日本[にほん]に行[い]きます..."
              />
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
          <>
            <div className="flex-1 shrink-0 min-h-0" />
            <HighlightProvider>
              <div className="w-full shrink-0 my-3">
                <div
                  className={`font-serif leading-relaxed whitespace-pre-wrap ${mode === "JA_TO_VI" ? "text-theme-japanese text-2xl sm:text-3xl" : "text-theme-primary text-xl sm:text-2xl"}`}
                >
                  {mode === "JA_TO_VI"
                    ? (
                      furiganaMode === 'off'
                        ? renderExampleHighlight(
                            currentExample.sentence,
                            currentExample.word,
                            mainDeck,
                          )
                        : (
                          <FuriganaSentence
                            sentence={currentExample.sentence}
                            furigana={currentExample.furigana}
                            mode={furiganaMode}
                            deck={mainDeck}
                            autoFetch={true}
                          />
                        )
                    )
                    : <HighlightVietnamese text={questionText} />}
                </div>
                {mode === "JA_TO_VI" && currentExample.reading && (
                  <p className="text-theme-accent opacity-80 mt-3 text-sm">
                    <RelatedHighlight text={currentExample.reading} type="hiragana" />
                  </p>
                )}
                {mode === "JA_TO_VI" && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleTTS(currentExample.sentence, e)}
                        className={`p-2 rounded-full transition-colors ${currentExample.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10'}`}
                        title={currentExample.audioUrl ? "Nghe file MP3" : "Phát âm"}
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      {currentExample.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(currentExample.sentence);
                        const btn = e.currentTarget;
                        const originalHTML = btn.innerHTML;
                        btn.innerHTML = '<svg class="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
                      }}
                      className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors"
                      title="Copy câu tiếng Nhật"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Translation input scratchpad */}
                <div
                  className="w-full max-w-lg mx-auto mt-5 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <label className="text-[11px] uppercase tracking-wider text-theme-primary/60 font-semibold">
                      {mode === "JA_TO_VI" ? "Dịch câu trên sang tiếng Việt:" : "Dịch câu trên sang tiếng Nhật:"}
                    </label>
                    {userTranslation && (
                      <button
                        type="button"
                        onClick={() => setUserTranslation("")}
                        className="text-[10px] text-theme-primary/40 hover:text-red-500 uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <textarea
                    value={userTranslation}
                    onChange={(e) => setUserTranslation(e.target.value)}
                    placeholder={
                      mode === "JA_TO_VI"
                        ? "Gõ bản dịch tiếng Việt của bạn (hoặc dịch nhẩm)..."
                        : "Gõ câu tiếng Nhật của bạn (hoặc dịch nhẩm)..."
                    }
                    rows={2}
                    className="w-full bg-theme-base/80 border border-theme-subtle focus:border-theme-accent rounded-lg p-3 text-sm text-theme-primary placeholder:text-theme-primary/30 outline-none transition-all resize-none shadow-xs"
                  />
                  <p className="text-[10px] text-theme-primary/40 mt-1 text-right">
                    Nhấn <kbd className="px-1.5 py-0.5 bg-theme-panel border border-theme-subtle rounded text-[9px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-theme-panel border border-theme-subtle rounded text-[9px] font-mono">Enter</kbd> hoặc nút Lật thẻ bên dưới
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAnswer(true);
                  }}
                  className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-theme-accent text-theme-inverted font-bold uppercase tracking-widest text-xs rounded-md shadow-xs hover:bg-theme-accent-hover transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Lật thẻ xem đáp án</span>
                </button>
              </div>
            </HighlightProvider>
            <div className="flex-1 shrink-0 min-h-0" />
          </>
        )}
      </div>

      {/* Back */}
      <div 
        className={`absolute inset-0 bg-theme-panel border border-theme-subtle p-6 sm:p-10 flex flex-col items-center text-center group overflow-y-auto rounded-xl shadow-xs ${!showAnswer ? 'pointer-events-none' : ''}`}
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <span className="absolute top-4 left-4 text-[11px] font-mono font-bold tracking-widest text-theme-accent/50 uppercase">
          {mode === "JA_TO_VI" ? "ĐÁP ÁN (TIẾNG VIỆT)" : "ĐÁP ÁN (TIẾNG NHẬT)"}
        </span>
        
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
            className="absolute top-4 right-4 text-theme-primary/40 hover:text-theme-accent transition-colors p-2 z-[100]"
            title="Sửa ví dụ"
          >
            <Pen className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex-1 shrink-0 min-h-0" />
        <HighlightProvider>
          <div className="w-full shrink-0 flex flex-col items-center justify-center my-3">
            {/* Câu hỏi gốc phía trên */}
            <div className="mb-4 text-theme-primary/60 text-xs sm:text-sm font-serif">
              <span className="text-[10px] uppercase tracking-wider block opacity-70 mb-0.5">
                {mode === "JA_TO_VI" ? "Câu tiếng Nhật:" : "Câu tiếng Việt:"}
              </span>
              <div className={mode === "JA_TO_VI" ? "text-theme-japanese font-medium" : "font-medium"}>
                {mode === "JA_TO_VI"
                  ? (
                    furiganaMode === 'off'
                      ? renderExampleHighlight(currentExample.sentence, currentExample.word, mainDeck)
                      : (
                        <FuriganaSentence
                          sentence={currentExample.sentence}
                          furigana={currentExample.furigana}
                          mode={furiganaMode}
                          deck={mainDeck}
                          autoFetch={true}
                        />
                      )
                  )
                  : currentExample.translation}
              </div>
            </div>

            {/* Bản dịch đối chiếu nếu người dùng đã gõ */}
            {userTranslation && (
              <div className="w-full max-w-lg mx-auto bg-theme-base/60 border border-theme-subtle rounded-lg p-3.5 mb-4 text-left shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-theme-primary/50 block mb-1">
                  Bản dịch của bạn:
                </span>
                <p className="text-sm font-medium text-theme-primary whitespace-pre-wrap">
                  {userTranslation}
                </p>
              </div>
            )}

            {/* Đáp án chuẩn */}
            <div className="w-full max-w-lg mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-3 text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 block mb-1.5">
                Đáp án chuẩn:
              </span>
              <div className={`font-serif leading-relaxed whitespace-pre-wrap ${mode === "VI_TO_JA" ? "text-theme-japanese text-xl sm:text-2xl" : "text-theme-primary text-lg sm:text-xl font-medium"}`}>
                {mode === "VI_TO_JA"
                  ? (
                    furiganaMode === 'off'
                      ? renderExampleHighlight(currentExample.sentence, currentExample.word, mainDeck)
                      : (
                        <FuriganaSentence
                          sentence={currentExample.sentence}
                          furigana={currentExample.furigana}
                          mode={furiganaMode}
                          deck={mainDeck}
                          autoFetch={true}
                        />
                      )
                  )
                  : <HighlightVietnamese text={answerText} />}
              </div>
              {mode === "VI_TO_JA" && currentExample.reading && (
                <p className="text-theme-accent opacity-80 mt-2 text-xs">
                  <RelatedHighlight text={currentExample.reading} type="hiragana" />
                </p>
              )}
              {mode === "VI_TO_JA" && currentExample.romaji && (
                <p className="text-theme-primary/40 mt-1 text-xs">
                  <RelatedHighlight text={currentExample.romaji} type="romaji" />
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={(e) => handleTTS(currentExample.sentence, e)}
                  className="p-1.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Phát âm</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(currentExample.sentence);
                    const btn = e.currentTarget;
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<span class="text-xs text-green-500 font-semibold">Đã copy!</span>';
                    setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
                  }}
                  className="p-1.5 text-theme-primary/50 hover:text-theme-accent transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Copy câu tiếng Nhật"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-wider">Copy</span>
                </button>
              </div>
            </div>

            {/* Lưu ý hoặc ghi chú nếu có */}
            {currentExample.specialNote && (
              <div className="mt-3 mx-auto max-w-lg p-4 bg-theme-accent/5 border-l-4 border-theme-accent rounded-r-lg relative text-left w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-theme-accent" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                    Lưu ý đặc biệt
                  </h4>
                </div>
                <div className="text-sm text-theme-primary/80 leading-relaxed font-serif markdown-body whitespace-pre-wrap">
                  <Markdown>{currentExample.specialNote}</Markdown>
                </div>
              </div>
            )}
            {currentExample.memo && (
              <div className="mt-3 p-3 bg-theme-hover border border-theme-subtle text-left max-w-lg w-full text-xs text-theme-primary/80 rounded">
                <span className="font-bold text-theme-accent uppercase tracking-wider block mb-1">Ghi chú:</span>
                <Markdown>{currentExample.memo}</Markdown>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-theme-subtle/50 text-xs text-theme-primary/40 flex gap-2 items-center justify-center w-full">
              <span>Từ vựng gốc:</span>
              <strong className="text-theme-primary/70 font-serif text-sm">
                {currentExample.word}
              </strong>
            </div>
          </div>
        </HighlightProvider>
        <div className="flex-1 shrink-0 min-h-0" />
      </div>
    </motion.div>
  </div>
</motion.div>
</AnimatePresence>
{!isEditing && (
  <div className="mt-6 flex items-center justify-center gap-3 w-full max-w-2xl">
    {showAnswer ? (
      isRandom ? (
        /* 2 Confirmation buttons: Dịch sai & Dịch đúng */
        <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-6 max-w-[440px]">
          <button
            id="btn-sentence-wrong"
            onClick={() => handleConfirmResult(false)}
            className="border-2 border-red-500/60 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white font-bold py-3.5 sm:py-4 transition-all flex items-center justify-center gap-2 rounded-xl shadow-xs uppercase tracking-wider text-xs sm:text-sm cursor-pointer"
            title="Phím tắt: 1 hoặc Mũi tên trái"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
            <span>Dịch sai (1)</span>
          </button>
          <button
            id="btn-sentence-correct"
            onClick={() => handleConfirmResult(true)}
            className="border-2 border-emerald-500 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 sm:py-4 transition-all flex items-center justify-center gap-2 rounded-xl shadow-md uppercase tracking-wider text-xs sm:text-sm cursor-pointer"
            title="Phím tắt: 2 hoặc Mũi tên phải"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Dịch đúng (2)</span>
          </button>
        </div>
      ) : (
        /* Regular SM-2 3 grading buttons */
        <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 max-w-[500px]">
          <button
            onClick={() => handleGrade('forgot')}
            className="border border-red-500/50 text-red-500 bg-theme-panel hover:bg-red-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1 rounded"
          >
            <span className="uppercase tracking-widest text-[9px] opacity-70">Quên sạch</span>
            <span className="text-xs">Lại từ đầu (1)</span>
          </button>
          <button
            onClick={() => handleGrade('hard')}
            className="border border-orange-500/50 text-orange-500 bg-theme-panel hover:bg-orange-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1 rounded"
          >
            <span className="uppercase tracking-widest text-[9px] opacity-70">Đã học</span>
            <span className="text-xs">{mode === "VI_TO_JA" ? "Chưa nói được (2)" : "Chưa nhớ (2)"}</span>
          </button>
          <button
            onClick={() => handleGrade('good')}
            className="border border-green-500 text-green-500 bg-theme-panel hover:bg-green-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1 rounded"
          >
            <span className="uppercase tracking-widest text-[9px] opacity-70">{mode === "VI_TO_JA" ? "Trôi chảy" : "Ghi nhớ"}</span>
            <span className="text-xs">{mode === "VI_TO_JA" ? "Nói được (3)" : "Đã nhớ (3)"}</span>
          </button>
        </div>
      )
    ) : (
      <button
        id="btn-flip-card"
        onClick={handleReveal}
        className="flex-1 max-w-[260px] border border-theme-accent text-theme-inverted bg-theme-accent hover:bg-theme-accent-hover font-bold py-4 transition-colors uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-lg shadow-sm cursor-pointer"
      >
        <Eye className="w-4 h-4" />
        <span>Lật thẻ xem đáp án</span>
      </button>
    )}

    <button
      onClick={handlePrev}
      disabled={isRandom ? randomCurrentIndex === 0 : currentIndex === 0}
      className="p-4 border border-theme-subtle text-theme-primary/60 hover:text-theme-primary hover:border-theme-accent transition-colors bg-theme-panel disabled:opacity-30 disabled:cursor-not-allowed rounded cursor-pointer"
      title="Câu trước"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
    <button
      onClick={handleNext}
      className="p-4 border border-theme-subtle text-theme-primary/60 hover:text-theme-primary hover:border-theme-accent transition-colors bg-theme-panel rounded cursor-pointer"
      title="Câu tiếp theo"
    >
      <ArrowRight className="w-5 h-5" />
    </button>
  </div>
)}
      </div>
    </div>
  );
};
