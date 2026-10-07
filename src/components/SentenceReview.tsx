import { usePersistentState } from '../hooks/usePersistentState';
import { playTTS, playAudioUrl, generateAndUploadTTS } from '../utils/playTTS';
import localforage from 'localforage';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Markdown from 'react-markdown';
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, Eye, Pen, Lightbulb, Volume2, Copy, Shuffle, Check, Trophy, RotateCcw, Sparkles, Upload, Trash2, Music, Play, Loader2, Brain, Clock, HelpCircle, VolumeX, Info, Flame } from "lucide-react";
import { IntensiveExample, IntensiveWord, KanjiCard, FuriganaMode } from "../types";
import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";
import { FuriganaSentence, FuriganaToggle } from "./FuriganaSentence";
import { fetchFuriganaWithGemini } from "../utils/furigana";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface SentenceReviewProps {
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  mode: "JA_TO_VI" | "VI_TO_JA";
  forceAll?: boolean;
  isRandom?: boolean;
  onClose: () => void;
  onUpdateWord?: (id: string, updates: Partial<IntensiveWord | KanjiCard | any>) => void;
  onRecordReview?: (isCorrect: boolean) => void;
}

interface ExampleWithWord extends IntensiveExample {
  word: string;
  wordId: string;
  sessionRepeat?: boolean;
  sessionRepeatCount?: number;
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
  const [currentIndexRaw, setCurrentIndex] = usePersistentState(`app_sentencereview_currentIndex_${mode}`, 0);
  
  // Dedicated state for card flipping - ALWAYS starts false (Front card first!)
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [randomCurrentIndex, setRandomCurrentIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState("");
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, total: 0, requeuedCount: 0 });
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = usePersistentState('app_sentencereview_autoplay_audio', true);
  const [audioOnlyFilter, setAudioOnlyFilter] = usePersistentState('app_sentencereview_audio_only', true);
  const [showScienceModal, setShowScienceModal] = useState(false);
  const [requeuedNotice, setRequeuedNotice] = useState(false);

  const currentIndex = isRandom
    ? (examples.length > 0 ? Math.min(randomCurrentIndex, examples.length - 1) : 0)
    : (examples.length > 0 ? Math.min(currentIndexRaw, examples.length - 1) : 0);

  const showAnswer = isCardFlipped;
  const setShowAnswer = (val: boolean) => {
    setIsCardFlipped(val);
  };
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear any legacy persistent flipped state on mount
  useEffect(() => {
    try {
      localStorage.removeItem('app_sentencereview_flippedState');
    } catch (_) {}
  }, []);

  // When index or mode changes, reset flip and translation so front card is ALWAYS displayed first
  useEffect(() => {
    setIsCardFlipped(false);
    setUserTranslation("");
  }, [currentIndex, mode]);



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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [previewAudioBlobUrl, setPreviewAudioBlobUrl] = useState<string | null>(null);
  const editAudioInputRef = React.useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState<{
    sentence: string;
    furigana: string;
    reading: string;
    romaji: string;
    translation: string;
    audioUrl: string | null;
    hasAudio: boolean;
  }>({
    sentence: "",
    furigana: "",
    reading: "",
    romaji: "",
    translation: "",
    audioUrl: null,
    hasAudio: false,
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
          allExamples.push({
            ...ex,
            audioUrl: ex.audioUrl || null,
            hasAudio: !!ex.audioUrl || !!ex.hasAudio,
            word: word.word,
            wordId: word.id
          });
        }
      });
    });

    // If reviewing generally without a specific single-word restriction, or in isRandom mode, also pull examples from mainDeck
    const isSingleWordReview = deck.length === 1 && !isRandom;
    if (mainDeck && !isSingleWordReview) {
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
                audioUrl: ex.audioUrl || null,
                hasAudio: !!ex.audioUrl || !!ex.hasAudio,
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
            audioUrl: null, // Card's audioUrl belongs to the vocabulary word, NOT to this example sentence
            hasAudio: false,
            word: card.kanji || card.reading,
            wordId: card.id,
          });
        }
      });
    }

    if (isRandom) {
      const hasAudioMp3 = (ex: ExampleWithWord) => {
        if (!ex.audioUrl || typeof ex.audioUrl !== 'string') return !!ex.hasAudio;
        const trimmed = ex.audioUrl.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return !!ex.hasAudio;
        return (
          trimmed.startsWith('http://') ||
          trimmed.startsWith('https://') ||
          trimmed.startsWith('firestore:') ||
          trimmed.startsWith('blob:') ||
          trimmed.startsWith('data:audio') ||
          !!ex.hasAudio
        );
      };

      const audioPool = allExamples.filter(hasAudioMp3);
      const pool = (audioOnlyFilter && audioPool.length > 0) ? audioPool : allExamples;

      const now = Date.now();
      const forgottenList: ExampleWithWord[] = [];
      const dueList: ExampleWithWord[] = [];
      const newList: ExampleWithWord[] = [];
      const learningList: ExampleWithWord[] = [];
      const matureList: ExampleWithWord[] = [];

      pool.forEach((ex) => {
        const interval = mode === "VI_TO_JA" ? (ex.viToJaInterval ?? 0) : (ex.jaToViInterval ?? 0);
        const failCount = mode === "VI_TO_JA" ? (ex.viToJaFailCount ?? 0) : (ex.jaToViFailCount ?? 0);
        const nextReview = mode === "VI_TO_JA" ? (ex.viToJaNextReviewDate ?? 0) : (ex.jaToViNextReviewDate ?? 0);
        const repetition = mode === "VI_TO_JA" ? (ex.viToJaRepetition ?? 0) : (ex.jaToViRepetition ?? 0);
        const isDue = nextReview > 0 && nextReview <= now;

        if (interval === 0 && failCount > 0) {
          forgottenList.push(ex); // 1. Từng bị quên: ưu tiên lặp lại cao nhất
        } else if (isDue) {
          dueList.push(ex); // 2. Đến hạn ôn theo đường cong quên lãng Ebbinghaus
        } else if (repetition === 0 && !nextReview) {
          newList.push(ex); // 3. Câu mới tinh chưa học
        } else if (interval <= 6) {
          learningList.push(ex); // 4. Trí nhớ ngắn hạn (1-6 ngày)
        } else {
          matureList.push(ex); // 5. Đã nhớ vững (>= 7 ngày) -> ít lặp lại hơn theo nguyên tắc khoa học
        }
      });

      const shuffle = <T,>(arr: T[]): T[] => {
        const res = [...arr];
        for (let i = res.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [res[i], res[j]] = [res[j], res[i]];
        }
        return res;
      };

      // Tỷ lệ chọn lọc khoa học:
      // - 100% câu đang quên + 100% câu đến hạn
      // - Tối đa 15 câu mới
      // - Tối đa 10 câu đang học
      // - Tối đa 3-4 câu đã nhớ vững (rất ít lặp lại)
      const selected = [
        ...shuffle(forgottenList),
        ...shuffle(dueList),
        ...shuffle(newList).slice(0, 15),
        ...shuffle(learningList).slice(0, 10),
        ...shuffle(matureList).slice(0, 3),
      ];

      // Bổ sung thêm nếu danh sách còn ít hơn 15 câu mà tổng pool còn nhiều
      if (selected.length < 15 && pool.length > selected.length) {
        const selectedIds = new Set(selected.map(s => s.id));
        const unselected = shuffle(pool.filter(p => !selectedIds.has(p.id)));
        selected.push(...unselected.slice(0, Math.min(25 - selected.length, unselected.length)));
      }

      const finalQueue = shuffle(selected.length > 0 ? selected : pool);
      setExamples(finalQueue);
      setRandomCurrentIndex(0);
      setIsCardFlipped(false);
      setUserTranslation("");
      setSessionStats({ correct: 0, wrong: 0, total: 0, requeuedCount: 0 });
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
  }, [deck, mainDeck, mode, forceAll, isRandom, audioOnlyFilter]);

  useEffect(() => {
    initExamples();
  }, [initExamples]);

  const handleNext = () => {
    setIsCardFlipped(false);
    setUserTranslation("");
    if (isRandom) {
      if (randomCurrentIndex < examples.length - 1) {
        setRandomCurrentIndex(prev => prev + 1);
      } else {
        setIsSessionFinished(true);
      }
      return;
    }
    if (currentIndex < examples.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsCardFlipped(false);
    setUserTranslation("");
    if (isRandom) {
      if (randomCurrentIndex > 0) {
        setRandomCurrentIndex(prev => prev - 1);
      }
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleConfirmResult = (isCorrect: boolean) => {
    handleGrade(isCorrect ? 'good' : 'forgot');
  };

  const handleGrade = (grade: 'forgot' | 'hard' | 'good' | 'easy') => {
    if (onRecordReview) {
      onRecordReview(grade !== 'forgot');
    }

    const currentExample = examples[currentIndex];
    if (!currentExample) return;

    // Calculate Spaced Repetition values using SM-2
    const currentInterval = mode === "VI_TO_JA" ? (currentExample.viToJaInterval || 0) : (currentExample.jaToViInterval || 0);
    const currentFailCount = mode === "VI_TO_JA" ? (currentExample.viToJaFailCount || 0) : (currentExample.jaToViFailCount || 0);
    const currentRepetition = mode === "VI_TO_JA" ? (currentExample.viToJaRepetition || 0) : (currentExample.jaToViRepetition || 0);
    const currentEaseFactor = mode === "VI_TO_JA" ? (currentExample.viToJaEaseFactor || 2.5) : (currentExample.jaToViEaseFactor || 2.5);

    let nextInterval = currentInterval;
    let nextRepetition = currentRepetition;
    let nextEaseFactor = currentEaseFactor;
    let newFailCount = currentFailCount;
    let isMastered = false;

    if (grade === 'forgot') {
      nextInterval = 0; // Học lại ngay
      nextRepetition = 0;
      newFailCount += 1;
      nextEaseFactor = Math.max(1.3, nextEaseFactor - 0.2);
      isMastered = false;
    } else if (grade === 'hard') {
      nextInterval = 1;
      newFailCount += 1;
      nextEaseFactor = Math.max(1.3, nextEaseFactor - 0.15);
      isMastered = false;
    } else if (grade === 'good') {
      if (nextRepetition === 0) {
        nextInterval = 1;
      } else if (nextRepetition === 1) {
        nextInterval = 3;
      } else if (nextRepetition === 2) {
        nextInterval = 7;
      } else {
        nextInterval = Math.round(Math.max(1, nextInterval) * nextEaseFactor);
      }
      nextRepetition += 1;
      isMastered = true;
    } else if (grade === 'easy') {
      if (nextRepetition === 0) {
        nextInterval = 3;
      } else if (nextRepetition === 1) {
        nextInterval = 7;
      } else {
        nextInterval = Math.round(Math.max(2, nextInterval) * (nextEaseFactor + 0.3));
      }
      nextRepetition += 1;
      nextEaseFactor = Math.min(3.0, nextEaseFactor + 0.15);
      isMastered = true;
    }

    let nextReviewDate = Date.now();
    if (nextInterval > 0) {
      nextReviewDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
    }

    const srsUpdates = mode === "VI_TO_JA"
      ? {
          viToJaMastered: isMastered,
          viToJaInterval: nextInterval,
          viToJaNextReviewDate: nextReviewDate,
          viToJaFailCount: newFailCount,
          viToJaRepetition: nextRepetition,
          viToJaEaseFactor: nextEaseFactor
        }
      : {
          jaToViMastered: isMastered,
          jaToViInterval: nextInterval,
          jaToViNextReviewDate: nextReviewDate,
          jaToViFailCount: newFailCount,
          jaToViRepetition: nextRepetition,
          jaToViEaseFactor: nextEaseFactor
        };

    if (onUpdateWord) {
      const targetId = currentExample.wordId;
      const word = deck.find((w) => w.id === targetId);
      if (word) {
        const updatedExamples = (word.examples || []).map((ex) => {
          if (ex.id === currentExample.id) {
            return { ...ex, ...srsUpdates };
          }
          return ex;
        });
        const oldScore = word.reviewScore || 0;
        let scoreDelta = grade === 'good' || grade === 'easy' ? 1 : (grade === 'hard' ? -1 : -2);
        const newScore = Math.max(0, oldScore + scoreDelta);
        onUpdateWord(word.id, { examples: updatedExamples, reviewScore: newScore });
      } else if (mainDeck) {
        const card = mainDeck.find((c) => c.id === targetId);
        if (card) {
          if (card.examples && Array.isArray(card.examples)) {
            const updatedExamples = card.examples.map((ex) => {
              if (ex.id === currentExample.id) {
                return { ...ex, ...srsUpdates };
              }
              return ex;
            });
            onUpdateWord(card.id, { examples: updatedExamples });
          }
        }
      }
    }

    // Update local state to reflect the change immediately
    setExamples((prev) =>
      prev.map((ex, i) => {
        if (i === currentIndex) {
          return { ...ex, ...srsUpdates };
        }
        return ex;
      })
    );

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      correct: (grade === 'good' || grade === 'easy') ? prev.correct + 1 : prev.correct,
      wrong: (grade === 'forgot' || grade === 'hard') ? prev.wrong + 1 : prev.wrong,
      total: prev.total + 1,
      requeuedCount: grade === 'forgot' ? (prev.requeuedCount || 0) + 1 : (prev.requeuedCount || 0)
    }));

    // In-session re-queueing for forgotten sentences
    if (grade === 'forgot') {
      setRequeuedNotice(true);
      setTimeout(() => setRequeuedNotice(false), 3000);

      setExamples((prev) => {
        const copy = [...prev];
        const repeatItem: ExampleWithWord = {
          ...copy[currentIndex],
          sessionRepeat: true,
          sessionRepeatCount: ((copy[currentIndex] as any).sessionRepeatCount || 0) + 1
        };
        const insertPos = Math.min(copy.length, currentIndex + 4);
        copy.splice(insertPos, 0, repeatItem);
        return copy;
      });
    }

    handleNext();
  };

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleStartEdit = async () => {
    const currentExample = examples[currentIndex];
    if (!currentExample) return;
    setEditData({
      sentence: currentExample.sentence,
      furigana: currentExample.furigana || "",
      reading: currentExample.reading || "",
      romaji: currentExample.romaji || "",
      translation: currentExample.translation || "",
      audioUrl: currentExample.audioUrl || null,
      hasAudio: !!currentExample.hasAudio || !!currentExample.audioUrl,
    });

    if (currentExample.audioUrl) {
      if (currentExample.audioUrl.startsWith('firestore:')) {
        const audioId = currentExample.audioUrl.split(':')[1];
        try {
          const docSnap = await getDoc(doc(db, 'global_audio', audioId));
          if (docSnap.exists()) {
            setPreviewAudioBlobUrl(docSnap.data().data);
          } else {
            setPreviewAudioBlobUrl(null);
          }
        } catch {
          setPreviewAudioBlobUrl(null);
        }
      } else {
        setPreviewAudioBlobUrl(currentExample.audioUrl);
      }
    } else if (currentExample.hasAudio) {
      try {
        const blob = await localforage.getItem<Blob>(`audio_intensive_${currentExample.wordId}_${currentExample.id}`);
        if (blob) {
          setPreviewAudioBlobUrl(URL.createObjectURL(blob));
        } else {
          setPreviewAudioBlobUrl(null);
        }
      } catch {
        setPreviewAudioBlobUrl(null);
      }
    } else {
      setPreviewAudioBlobUrl(null);
    }

    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleUploadEditAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAudio(true);
    try {
      const base64 = await fileToBase64(file);
      const audioId = `sentence_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'global_audio', audioId), {
            data: base64,
            createdAt: Date.now(),
            filename: file.name
          });
          const firestoreUrl = `firestore:${audioId}`;
          setEditData(prev => ({ ...prev, audioUrl: firestoreUrl, hasAudio: true }));
          setPreviewAudioBlobUrl(base64);
        } catch (storageErr) {
          console.warn("Firestore audio upload failed, falling back to data URL:", storageErr);
          setEditData(prev => ({ ...prev, audioUrl: base64, hasAudio: true }));
          setPreviewAudioBlobUrl(base64);
        }
      } else {
        setEditData(prev => ({ ...prev, audioUrl: base64, hasAudio: true }));
        setPreviewAudioBlobUrl(base64);
      }
    } catch (err: any) {
      console.error("Audio upload error:", err);
      alert("Lỗi khi tải file âm thanh lên: " + (err.message || "Vui lòng thử lại"));
    } finally {
      setIsUploadingAudio(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGenerateAIAudio = async () => {
    const textToSpeak = editData.sentence.trim();
    if (!textToSpeak) {
      alert("Vui lòng nhập câu tiếng Nhật trước khi tạo âm thanh AI.");
      return;
    }
    setIsGeneratingAudio(true);
    try {
      const cloudUrl = await generateAndUploadTTS(textToSpeak);
      if (cloudUrl) {
        setEditData(prev => ({ ...prev, audioUrl: cloudUrl, hasAudio: true }));
        if (cloudUrl.startsWith('firestore:')) {
          const audioId = cloudUrl.split(':')[1];
          try {
            const docSnap = await getDoc(doc(db, 'global_audio', audioId));
            if (docSnap.exists()) {
              setPreviewAudioBlobUrl(docSnap.data().data);
            } else {
              setPreviewAudioBlobUrl(cloudUrl);
            }
          } catch {
            setPreviewAudioBlobUrl(cloudUrl);
          }
        } else {
          setPreviewAudioBlobUrl(cloudUrl);
        }
        playAudioUrl(cloudUrl, textToSpeak);
      } else {
        alert("Không thể tạo file âm thanh AI lúc này. Vui lòng thử lại sau.");
      }
    } catch (err: any) {
      console.error("AI TTS error:", err);
      alert("Lỗi khi tạo âm thanh AI: " + (err?.message || "Vui lòng thử lại."));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleRemoveEditAudio = () => {
    setEditData(prev => ({ ...prev, audioUrl: null, hasAudio: false }));
    setPreviewAudioBlobUrl(null);
  };

  const handlePlayPreviewAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewAudioBlobUrl) {
      playAudioUrl(previewAudioBlobUrl, editData.sentence);
    } else if (editData.audioUrl) {
      playAudioUrl(editData.audioUrl, editData.sentence);
    } else if (editData.sentence) {
      playTTS(editData.sentence);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(editData.sentence || "").trim()) return;

    const currentExample = examples[currentIndex];
    if (!currentExample) return;

    if (onUpdateWord) {
      const targetId = currentExample.wordId;
      const word = deck.find((w) => w.id === targetId);
      if (word) {
        const updatedExamples = (word.examples || []).map((ex) => {
          if (ex.id === currentExample.id) {
            return {
              ...ex,
              sentence: String(editData.sentence || "").trim(),
              furigana: String(editData.furigana || "").trim(),
              reading: String(editData.reading || "").trim(),
              romaji: String(editData.romaji || "").trim(),
              translation: String(editData.translation || "").trim(),
              audioUrl: editData.audioUrl,
              hasAudio: editData.hasAudio,
            };
          }
          return ex;
        });
        onUpdateWord(word.id, { examples: updatedExamples });
      } else if (mainDeck) {
        const card = mainDeck.find((c) => c.id === targetId);
        if (card) {
          if (card.examples && Array.isArray(card.examples)) {
            const updatedExamples = card.examples.map((ex) => {
              if (ex.id === currentExample.id) {
                return {
                  ...ex,
                  sentence: String(editData.sentence || "").trim(),
                  furigana: String(editData.furigana || "").trim(),
                  reading: String(editData.reading || "").trim(),
                  romaji: String(editData.romaji || "").trim(),
                  translation: String(editData.translation || "").trim(),
                  audioUrl: editData.audioUrl,
                  hasAudio: editData.hasAudio,
                };
              }
              return ex;
            });
            onUpdateWord(card.id, { examples: updatedExamples });
          } else {
            onUpdateWord(card.id, {
              example: String(editData.sentence || "").trim(),
              exampleTranslation: String(editData.translation || "").trim(),
              exampleAudioUrl: editData.audioUrl,
            } as any);
          }
        }
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
            audioUrl: editData.audioUrl,
            hasAudio: editData.hasAudio,
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
        // Back face: 4-tier scientific SRS rating
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleGrade('forgot');
        } else if (e.key === '2') {
          e.preventDefault();
          handleGrade('hard');
        } else if (e.key === '3' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleGrade('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleGrade('easy');
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
          Hoàn thành phiên dịch câu SRS!
        </h2>
        <p className="text-theme-primary/60 text-xs mb-4 uppercase tracking-wider font-semibold">
          {mode === "JA_TO_VI" ? "Dịch câu: Nhật → Việt" : "Dịch câu: Việt → Nhật"} • Nguyên tắc Ebbinghaus
        </p>

        {/* Thẻ thống kê 4 ô */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full bg-theme-panel border border-theme-subtle p-5 rounded-xl mb-6 shadow-sm">
          <div className="flex flex-col items-center p-2 rounded-lg bg-theme-base/50">
            <span className="text-2xl font-bold text-theme-primary">{sessionStats.total}</span>
            <span className="text-[10px] text-theme-primary/60 uppercase tracking-wider mt-1 font-semibold">Đã luyện</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/10">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sessionStats.correct}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1 font-semibold">Dịch tốt</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-red-500/10">
            <span className="text-2xl font-bold text-red-500">{sessionStats.wrong}</span>
            <span className="text-[10px] text-red-500 uppercase tracking-wider mt-1 font-semibold">Dịch sai</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-indigo-500/10">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{sessionStats.requeuedCount || 0}</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1 font-semibold">Đã ôn lại</span>
          </div>
        </div>

        <div className="w-full bg-theme-panel/70 border border-theme-subtle rounded-xl p-4 mb-6 text-left text-xs text-theme-primary/80 leading-relaxed">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-theme-accent">
            <Brain className="w-4 h-4" />
            <span>Ghi nhớ khoa học Ebbinghaus</span>
          </div>
          <p>
            Các câu bạn dịch tốt đã được tự động kéo dài chu kỳ giãn cách (3 &ndash; 7 &ndash; 16+ ngày). Các câu bạn từng quên đã được lặp lại ngay trong phiên để kịp thời củng cố trước khi kết thúc!
          </p>
        </div>

        <div className="text-sm text-theme-primary/80 mb-6 font-medium">
          Độ chính xác: <span className="text-theme-accent text-xl font-bold ml-1">{accuracy}%</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={initExamples}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-theme-accent text-theme-inverted font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-theme-accent-hover transition-colors shadow-sm cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Luyện phiên mới (SRS)</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 border border-theme-subtle text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover font-bold uppercase tracking-widest text-xs rounded-xl transition-colors cursor-pointer"
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
          {isRandom
            ? "Chưa có câu ví dụ nào có file MP3 âm thanh upload thành công để ôn tập ngẫu nhiên. Vui lòng upload file âm thanh MP3 cho các câu ví dụ trước nhé!"
            : (deck.some((word) => (word.examples || []).length > 0)
              ? "Tuyệt vời, bạn đã hoàn thành hết các câu đến hạn!"
              : "Chưa có câu ví dụ nào trong dữ liệu để ôn tập.")}
        </p>
        <button
          onClick={onClose}
          className="border border-theme-subtle hover:border-theme-accent text-theme-accent bg-theme-panel px-8 py-3 rounded-none uppercase tracking-[0.2em] text-xs transition-colors cursor-pointer"
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
                {isRandom ? "Dịch câu Khoa học SRS: " : "Ôn tập câu: "}
                {mode === "JA_TO_VI" ? "Nhật → Việt" : "Việt → Nhật"}
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                <Brain className="w-2.5 h-2.5" />
                SRS Ebbinghaus
              </span>
            </div>
            <p className="text-xs text-theme-primary/50 mt-0.5">
              Câu {currentIndex + 1} / {examples.length}{" "}
              <span className="opacity-70">
                ({examples.length - currentIndex - 1} câu còn lại)
              </span>
              {sessionStats.requeuedCount > 0 && (
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1.5">
                  • {sessionStats.requeuedCount} câu đang lặp lại
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <FuriganaToggle mode={furiganaMode} onChange={setFuriganaMode} />

          <button
            type="button"
            onClick={() => setShowScienceModal(true)}
            className="px-2.5 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xem nguyên tắc khoa học đường cong quên lãng Ebbinghaus & Spaced Repetition (SRS)"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Khoa học SRS</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
              autoPlayAudio
                ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/40 font-bold'
                : 'bg-theme-panel text-theme-primary/50 border-theme-subtle hover:text-theme-primary'
            }`}
            title={autoPlayAudio ? "Tự động phát MP3 khi lật thẻ: Đang BẬT" : "Tự động phát MP3 khi lật thẻ: Đang TẮT"}
          >
            {autoPlayAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline text-[11px] uppercase tracking-wider">{autoPlayAudio ? "Auto MP3: Bật" : "Auto MP3: Tắt"}</span>
          </button>

          {isRandom && (
            <button
              onClick={initExamples}
              title="Xáo trộn lại toàn bộ câu ngẫu nhiên theo nguyên tắc khoa học"
              className="px-2.5 py-1.5 text-xs text-theme-primary/70 hover:text-theme-accent border border-theme-subtle hover:border-theme-accent bg-theme-panel rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider">Xáo trộn</span>
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
        id="sentence-review-card-front"
        className={`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center group overflow-y-auto ${showAnswer ? 'pointer-events-none' : ''}`}
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      >
        {/* Badges khoa học SRS */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 z-20">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-theme-base border border-theme-subtle text-theme-primary/70">
            {mode === "JA_TO_VI" ? "CÂU HỎI NHẬT" : "DỊCH VIỆT → NHẬT"}
          </span>

          {currentExample.sessionRepeat && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-red-500/15 text-red-500 border border-red-500/30 flex items-center gap-1 animate-pulse">
              <RotateCcw className="w-2.5 h-2.5" />
              Lặp lại câu quên
            </span>
          )}

          {/* Ebbinghaus Stage Indicator */}
          {(() => {
            const interval = mode === "VI_TO_JA" ? (currentExample.viToJaInterval ?? 0) : (currentExample.jaToViInterval ?? 0);
            const repetition = mode === "VI_TO_JA" ? (currentExample.viToJaRepetition ?? 0) : (currentExample.jaToViRepetition ?? 0);
            if (interval === 0 && (currentExample.viToJaFailCount || currentExample.jaToViFailCount)) {
              return (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  Cần củng cố gấp
                </span>
              );
            }
            if (repetition === 0 && !currentExample.viToJaNextReviewDate && !currentExample.jaToViNextReviewDate) {
              return (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Câu mới
                </span>
              );
            }
            if (interval <= 3) {
              return (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Trí nhớ ngắn hạn ({interval}d)
                </span>
              );
            }
            if (interval <= 14) {
              return (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Trí nhớ trung hạn ({interval}d)
                </span>
              );
            }
            return (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Trí nhớ dài hạn ({interval}d)
              </span>
            );
          })()}
        </div>
        
        <button
          id="btn-edit-sentence-front"
          type="button"
          onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-theme-subtle text-theme-primary/70 hover:text-theme-accent hover:border-theme-accent bg-theme-panel hover:bg-theme-hover transition-all text-xs z-30 cursor-pointer shadow-xs"
          title="Chỉnh sửa câu ví dụ này (Chế độ bút sửa)"
        >
          <Pen className="w-3.5 h-3.5 text-theme-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Sửa câu</span>
        </button>

        <div className="flex-1 shrink-0 min-h-0" />
        <HighlightProvider>
          <div className="w-full shrink-0 my-3">
            <div
              id="sentence-review-question-text"
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
                    id="btn-sentence-audio"
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
                  id="btn-copy-sentence"
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
                id="sentence-review-user-translation-input"
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
              id="btn-flip-card-front"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAnswer(true);
              }}
              className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-theme-accent text-theme-inverted font-bold uppercase tracking-widest text-xs rounded-md shadow-xs hover:bg-theme-accent-hover transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{mode === "JA_TO_VI" ? "Lật thẻ xem dịch nghĩa (Tiếng Việt)" : "Lật thẻ xem đáp án câu (Tiếng Nhật)"}</span>
            </button>
          </div>
        </HighlightProvider>
        <div className="flex-1 shrink-0 min-h-0" />
      </div>

      {/* Back */}
      <div 
        className={`absolute inset-0 bg-theme-panel border border-theme-subtle p-6 sm:p-10 flex flex-col items-center text-center group overflow-y-auto rounded-xl shadow-xs ${!showAnswer ? 'pointer-events-none' : ''}`}
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <span className="absolute top-4 left-4 text-[11px] font-mono font-bold tracking-widest text-theme-accent/50 uppercase">
          {mode === "JA_TO_VI" ? "ĐÁP ÁN (TIẾNG VIỆT)" : "ĐÁP ÁN (TIẾNG NHẬT)"}
        </span>
        
        <button
          id="btn-edit-sentence-back"
          type="button"
          onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-theme-subtle text-theme-primary/70 hover:text-theme-accent hover:border-theme-accent bg-theme-panel hover:bg-theme-hover transition-all text-xs z-30 cursor-pointer shadow-xs"
          title="Chỉnh sửa câu ví dụ này (Chế độ bút sửa)"
        >
          <Pen className="w-3.5 h-3.5 text-theme-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Sửa câu</span>
        </button>
        
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
      /* 4-tier scientific SRS rating buttons */
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-[620px]">
        <button
          id="btn-sentence-forgot"
          type="button"
          onClick={() => handleGrade('forgot')}
          className="border-2 border-red-500/60 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white font-bold py-2.5 sm:py-3 transition-all flex flex-col items-center justify-center rounded-xl shadow-xs cursor-pointer group"
          title="Phím tắt: 1 hoặc Mũi tên trái"
        >
          <div className="flex items-center gap-1">
            <X className="w-4 h-4 stroke-[3]" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Quên (1)</span>
          </div>
          <span className="text-[10px] opacity-75 mt-0.5 font-normal">Lặp lại trong phiên</span>
        </button>

        <button
          id="btn-sentence-hard"
          type="button"
          onClick={() => handleGrade('hard')}
          className="border-2 border-amber-500/60 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500 hover:text-white font-bold py-2.5 sm:py-3 transition-all flex flex-col items-center justify-center rounded-xl shadow-xs cursor-pointer group"
          title="Phím tắt: 2"
        >
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Khó (2)</span>
          </div>
          <span className="text-[10px] opacity-75 mt-0.5 font-normal">Lặp lại sau 1 ngày</span>
        </button>

        <button
          id="btn-sentence-good"
          type="button"
          onClick={() => handleGrade('good')}
          className="border-2 border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold py-2.5 sm:py-3 transition-all flex flex-col items-center justify-center rounded-xl shadow-xs cursor-pointer group"
          title="Phím tắt: 3 hoặc Mũi tên phải"
        >
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Nhớ tốt (3)</span>
          </div>
          <span className="text-[10px] opacity-75 mt-0.5 font-normal">Giãn cách 3-6 ngày</span>
        </button>

        <button
          id="btn-sentence-easy"
          type="button"
          onClick={() => handleGrade('easy')}
          className="border-2 border-indigo-500/60 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white font-bold py-2.5 sm:py-3 transition-all flex flex-col items-center justify-center rounded-xl shadow-xs cursor-pointer group"
          title="Phím tắt: 4"
        >
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Dễ dàng (4)</span>
          </div>
          <span className="text-[10px] opacity-75 mt-0.5 font-normal">Giãn cách 10-20 ngày</span>
        </button>
      </div>
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

      {/* Modal Chế độ Bút Sửa Chữa Câu Ví Dụ */}
      <AnimatePresence>
        {isEditing && (
          <div 
            id="sentence-review-edit-modal-overlay"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={handleCancelEdit}
          >
            <motion.div
              id="sentence-review-edit-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-theme-panel border border-theme-subtle rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-theme-subtle">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-theme-accent/10 text-theme-accent">
                    <Pen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-theme-primary">Chế độ sửa câu ví dụ</h3>
                    <p className="text-xs text-theme-primary/50">Chỉnh sửa câu tiếng Nhật, Furigana và nghĩa tiếng Việt</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1.5 text-theme-primary/50 hover:text-theme-primary transition-colors rounded-lg hover:bg-theme-hover cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-theme-primary/70 font-bold">
                      Câu ví dụ (Nhật) *
                    </label>
                    <button
                      id="btn-ai-furigana"
                      type="button"
                      onClick={handleGenerateAIFurigana}
                      disabled={isGeneratingFurigana || !editData.sentence.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20 rounded-md border border-theme-accent/30 transition-all disabled:opacity-50 cursor-pointer"
                      title="Dùng Gemini AI để phân tích và tự động điền Furigana theo ngữ cảnh"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingFurigana ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingFurigana ? "Đang tạo Furigana..." : "✨ Tạo Furigana bằng AI"}</span>
                    </button>
                  </div>
                  <textarea 
                    id="edit-sentence-input"
                    required 
                    rows={2} 
                    value={editData.sentence} 
                    onChange={(e) => setEditData({ ...editData, sentence: e.target.value })} 
                    className="w-full bg-theme-base border border-theme-subtle rounded-lg p-3 text-sm focus:outline-none focus:border-theme-accent text-theme-japanese font-serif resize-none" 
                    placeholder="Nhập câu tiếng Nhật..." 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/70 font-bold flex items-center justify-between">
                    <span>Furigana (Định dạng: 漢字[かんじ])</span>
                    <span className="text-[10px] text-theme-accent lowercase font-normal">Tự động sinh hoặc gõ thủ công</span>
                  </label>
                  <input
                    id="edit-furigana-input"
                    type="text"
                    value={editData.furigana || ""}
                    onChange={(e) => setEditData({ ...editData, furigana: e.target.value })}
                    className="w-full bg-theme-base border border-theme-subtle rounded-lg p-3 text-sm focus:outline-none focus:border-theme-accent text-theme-japanese font-serif"
                    placeholder="VD: 彼女[かのじょ]は日本[にほん]に行[い]きます..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-theme-primary/70 font-bold">Cách đọc (Hiragana)</label>
                    <input 
                      id="edit-reading-input"
                      type="text" 
                      value={editData.reading} 
                      onChange={(e) => setEditData({ ...editData, reading: e.target.value })} 
                      className="w-full bg-theme-base border border-theme-subtle rounded-lg p-3 text-sm focus:outline-none focus:border-theme-accent" 
                      placeholder="VD: にほんりょうり..." 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-theme-primary/70 font-bold">Romaji</label>
                    <input 
                      id="edit-romaji-input"
                      type="text" 
                      value={editData.romaji} 
                      onChange={(e) => setEditData({ ...editData, romaji: e.target.value })} 
                      className="w-full bg-theme-base border border-theme-subtle rounded-lg p-3 text-sm focus:outline-none focus:border-theme-accent font-mono" 
                      placeholder="VD: nihonryouri..." 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/70 font-bold">Nghĩa tiếng Việt *</label>
                  <textarea 
                    id="edit-translation-input"
                    required
                    rows={2} 
                    value={editData.translation} 
                    onChange={(e) => setEditData({ ...editData, translation: e.target.value })} 
                    className="w-full bg-theme-base border border-theme-subtle rounded-lg p-3 text-sm focus:outline-none focus:border-theme-accent resize-none" 
                    placeholder="Nhập bản dịch tiếng Việt..." 
                  />
                </div>

                {/* Audio MP3 section */}
                <div id="edit-sentence-audio-section" className="space-y-2 pt-3 border-t border-theme-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-theme-primary/70 font-bold flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-theme-accent" />
                      <span>File âm thanh MP3 phát âm</span>
                    </label>
                    {editData.audioUrl && (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Đã có MP3
                      </span>
                    )}
                  </div>

                  <input
                    id="edit-sentence-audio-file-input"
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a"
                    ref={editAudioInputRef}
                    onChange={handleUploadEditAudio}
                    className="hidden"
                  />

                  {previewAudioBlobUrl || editData.audioUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-theme-base rounded-lg border border-theme-subtle">
                      <div className="flex items-center gap-2">
                        <button
                          id="btn-play-preview-audio"
                          type="button"
                          onClick={handlePlayPreviewAudio}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent text-theme-inverted hover:bg-theme-accent-hover rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="Nghe thử file âm thanh này"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Nghe thử MP3</span>
                        </button>
                        <span className="text-[11px] text-theme-primary/60 font-mono truncate max-w-[140px] sm:max-w-[200px]">
                          {editData.audioUrl?.startsWith('firestore:') ? 'Firebase Cloud Audio' : 'Audio MP3'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          id="btn-replace-audio"
                          type="button"
                          onClick={() => editAudioInputRef.current?.click()}
                          disabled={isUploadingAudio || isGeneratingAudio}
                          className="text-xs text-theme-primary/70 hover:text-theme-accent px-2.5 py-1 rounded border border-theme-subtle hover:border-theme-accent transition-all cursor-pointer disabled:opacity-50"
                          title="Thay thế file MP3 khác"
                        >
                          {isUploadingAudio ? 'Đang tải...' : 'Đổi file...'}
                        </button>
                        <button
                          id="btn-delete-audio"
                          type="button"
                          onClick={handleRemoveEditAudio}
                          className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                          title="Xóa file âm thanh này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-theme-base/60 border border-dashed border-theme-subtle rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-theme-primary/60 font-medium">Chưa có file âm thanh MP3 cho câu này.</p>
                        <p className="text-[11px] text-theme-primary/40">Tải file MP3 của bạn lên hoặc để AI tự động đọc và tạo file.</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          id="btn-upload-audio-modal"
                          type="button"
                          onClick={() => editAudioInputRef.current?.click()}
                          disabled={isUploadingAudio || isGeneratingAudio}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-panel border border-theme-subtle hover:border-theme-accent text-theme-primary/80 hover:text-theme-accent rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingAudio ? 'Đang tải...' : 'Tải file MP3'}</span>
                        </button>
                        <button
                          id="btn-generate-ai-audio-modal"
                          type="button"
                          onClick={handleGenerateAIAudio}
                          disabled={isGeneratingAudio || isUploadingAudio || !editData.sentence.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 border border-theme-accent/30 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                          title="Dùng AI (Inworld/Gemini) để tự động tạo file MP3 giọng chuẩn"
                        >
                          {isGeneratingAudio ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang tạo AI...</span>
                            </>
                          ) : (
                            <>
                              <Music className="w-3.5 h-3.5" />
                              <span>Tải âm thanh (AI)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-theme-subtle">
                  <button 
                    id="btn-cancel-edit-sentence"
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="flex-1 px-4 py-2.5 text-xs tracking-widest uppercase font-bold border border-theme-subtle text-theme-primary/70 hover:bg-theme-hover rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button 
                    id="btn-save-edit-sentence"
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-xs tracking-widest uppercase font-bold bg-theme-accent text-theme-inverted hover:bg-theme-accent-hover rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Toast thông báo lặp lại câu quên */}
      <AnimatePresence>
        {requeuedNotice && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-theme-panel border border-red-500/50 text-red-600 dark:text-red-400 shadow-2xl flex items-center gap-2.5 text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4 text-red-500 animate-spin" />
            <span>Đã xếp lại câu này vào cuối phiên để củng cố trí nhớ!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal giải thích nguyên tắc khoa học Ebbinghaus & SRS */}
      <AnimatePresence>
        {showScienceModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowScienceModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-theme-panel border border-theme-subtle rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-auto"
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-theme-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-theme-primary">Nguyên tắc khoa học Ebbinghaus &amp; SRS</h3>
                    <p className="text-xs text-theme-primary/50">Hệ thống lặp lại ngắt quãng (Spaced Repetition)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScienceModal(false)}
                  className="p-1.5 text-theme-primary/50 hover:text-theme-primary rounded-lg cursor-pointer hover:bg-theme-hover transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-theme-primary/80 leading-relaxed">
                <p>
                  Theo nghiên cứu kinh điển của nhà tâm lý học Đức <strong>Hermann Ebbinghaus</strong>, não bộ con người có xu hướng <strong>quên đi hơn 70% kiến thức mới sau 24 giờ</strong> nếu không được tái kích hoạt đúng thời điểm.
                </p>

                <div className="p-3.5 bg-theme-base rounded-xl border border-theme-subtle space-y-2.5">
                  <div className="font-bold text-theme-accent text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Thuật toán thông minh của chế độ này:
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold shrink-0">1.</span>
                    <span><strong>Lặp lại câu quên ngay trong phiên:</strong> Khi bạn chọn &ldquo;Quên&rdquo;, câu đó sẽ tự động chèn lại vào cuối phiên để não bộ kịp thời tái kích hoạt đường mòn thần kinh trước khi bạn kết thúc.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0">2.</span>
                    <span><strong>Củng cố trí nhớ ngắn hạn:</strong> Các câu khó hoặc vừa học sẽ được lặp lại sau 1 &ndash; 3 ngày.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">3.</span>
                    <span><strong>Giãn cách câu đã nhớ (Ít lặp lại hơn):</strong> Các câu bạn đã dịch trôi chảy sẽ tự động được kéo dài chu kỳ (3 ngày &rarr; 7 ngày &rarr; 16 ngày &rarr; 35 ngày...). Chúng sẽ xuất hiện với tần suất rất thấp để tránh làm mất thời gian quý báu của bạn, nhưng đảm bảo lưu giữ vĩnh viễn vào trí nhớ dài hạn.</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-theme-accent/10 border border-theme-accent/20 text-theme-accent flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Hãy luyện tập đều đặn mỗi ngày 5-10 phút để đạt phản xạ ngôn ngữ tự nhiên nhất!</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-theme-subtle flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowScienceModal(false)}
                  className="px-5 py-2 bg-theme-accent text-theme-inverted font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-theme-accent-hover transition-colors cursor-pointer"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
