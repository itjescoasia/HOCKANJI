import Markdown from 'react-markdown';
import React, { useState, useEffect, Fragment } from 'react';
import { KanjiCard, ReviewGrade } from '../types';
import { motion } from 'motion/react';
import { X, Trash2, Volume2, Edit3 } from 'lucide-react';
import { renderExampleHighlight, RelatedHighlight, HighlightVietnamese, HighlightProvider } from '../utils/highlight';
import ReviewEditForm from './ReviewEditForm';

interface ReviewSessionProps {
  dueCards: KanjiCard[];
  onReview: (id: string, grade: ReviewGrade) => void;
  onFreeStudyReview?: (id: string, isRemember: boolean) => void;
  onClose: () => void;
  onRemoveCard: (id: string) => void;
  onUpdateCard?: (id: string, data: Partial<KanjiCard>) => void;
  isFreeStudy?: boolean;
  isDifficultReview?: boolean;
}

export default function ReviewSession({ dueCards, onReview, onFreeStudyReview, onClose, onRemoveCard, onUpdateCard, isFreeStudy = false, isDifficultReview = false }: ReviewSessionProps) {
  const [reviewQueue, setReviewQueue] = useState<KanjiCard[]>(dueCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedState, setFlippedState] = useState<Record<number, boolean>>({});
  const showAnswer = flippedState[currentIndex] || false;
  const setShowAnswer = (val: boolean) => setFlippedState(prev => ({ ...prev, [currentIndex]: val }));
  const [successCounts, setSuccessCounts] = useState<Record<string, number>>({});
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<KanjiCard>>({});

  const [readingInput, setReadingInput] = useState('');
  const [inputError, setInputError] = useState(false);
  const [wrongMcqOption, setWrongMcqOption] = useState<string | null>(null);
  
  const [exerciseType, setExerciseType] = useState<'typing_reading' | 'mcq_meaning' | 'mcq_reading' | 'flip'>('flip');
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);

  const currentCard = reviewQueue[currentIndex];

  // Reset internal states when current index changes
  useEffect(() => {
    setReadingInput('');
    setInputError(false);
    setWrongMcqOption(null);

    if (isFreeStudy && currentCard) {
      const correctAnswer = currentCard.meaning || '';
      const allOptions = Array.from(new Set(dueCards.map(c => c.meaning).filter(Boolean))) as string[];
      
      if (allOptions.length < 2) {
        setExerciseType('flip');
      } else {
        setExerciseType('mcq_meaning');
        const wrongOptions = allOptions.filter(o => String(o || "").trim().toLowerCase() !== String(correctAnswer || "").trim().toLowerCase());
        
        // Fisher-Yates shuffle wrongOptions
        for (let i = wrongOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
        }
        
        // Take up to 9 wrong options for 10 total
        const shuffledWrong = wrongOptions.slice(0, 9);
        const finalOptions = [correctAnswer, ...shuffledWrong];
        
        // Fisher-Yates shuffle finalOptions
        for (let i = finalOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
        }
        
        setMcqOptions(finalOptions);
      }
    } else {
      setExerciseType('flip');
    }
  }, [currentIndex, isFreeStudy, isDifficultReview, currentCard, dueCards]);


  if (currentIndex >= reviewQueue.length) {
    return (
      <div className="fixed inset-0 bg-theme-base-alt/95 flex flex-col items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-theme-panel border border-theme-subtle p-12 text-center max-w-md w-full shadow-2xl"
        >
          <div className="w-16 h-16 border border-theme-accent text-theme-accent flex items-center justify-center mx-auto mb-8 bg-theme-hover">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-serif text-theme-accent mb-4 tracking-widest uppercase">Hoàn Tất Phiên Học</h2>
          <p className="text-theme-primary opacity-50 mb-10 text-sm leading-relaxed tracking-wide">Tuyệt vời. Bạn đã hoàn thành tất cả các từ cần ôn cho hôm nay. Sự kiên trì sẽ tạo nên sự thành thạo.</p>
          <button 
            onClick={onClose}
            className="w-full bg-theme-hover border border-theme-accent hover:bg-theme-accent hover:text-theme-inverted text-theme-accent font-medium py-4 uppercase tracking-[0.2em] text-[11px] transition-colors"
          >
            Trở lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  const handleGrade = (grade: ReviewGrade) => {
    onReview(currentCard.id, grade);
    setFlippedState(fs => ({ ...fs, [currentIndex + 1]: false })); setCurrentIndex(prev => prev + 1);
  };

  const handleFreeStudyRemember = () => {
    if (onFreeStudyReview) onFreeStudyReview(currentCard.id, true);
    
    const count = (successCounts[currentCard.id] || 0) + 1;
    setSuccessCounts(prev => ({ ...prev, [currentCard.id]: count }));

    if (count < 3) {
      setReviewQueue(prev => {
        const newQueue = [...prev];
        const offset = count === 1 ? 4 : 6;
        const insertIndex = Math.min(newQueue.length, currentIndex + offset);
        newQueue.splice(insertIndex, 0, currentCard);
        return newQueue;
      });
    }

    setFlippedState(fs => ({ ...fs, [currentIndex + 1]: false })); setCurrentIndex(prev => prev + 1);
  };

  const handleFreeStudyForgot = () => {
    if (onFreeStudyReview) onFreeStudyReview(currentCard.id, false);
    setReviewQueue(prev => [...prev, currentCard]);
    setFlippedState(fs => ({ ...fs, [currentIndex + 1]: false })); setCurrentIndex(prev => prev + 1);
  };

  const handleCheckReading = () => {
    if (String(readingInput || "").trim() === String(currentCard.reading || "").trim()) {
      setInputError(false);
      setShowAnswer(true);
    } else {
      setInputError(true);
    }
  };

  const isWordWithKanji = currentCard?.kanji && currentCard?.reading && String(currentCard.kanji || "").trim() !== String(currentCard.reading || "").trim();

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
    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
      onRemoveCard(currentCard.id);
      setReviewQueue(prev => prev.filter((_, i) => i !== currentIndex));
      setShowAnswer(false);
    }
  };

  useEffect(() => {
    // Triggers speech synthesis voices to load on mount
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const getJapaneseVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize high quality/native voices if available on the user's OS/Browser
    return voices.find(v => v.lang === 'ja-JP' && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural') || v.name.includes('Kyoko') || v.name.includes('Otoya') || v.name.includes('Ayumi'))) 
        || voices.find(v => v.lang === 'ja-JP')
        || voices.find(v => v.lang.startsWith('ja'));
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      // Tùy chỉnh tham số phụ để nghe tự nhiên hơn một chút
      utterance.rate = 0.9; // Đọc chậm lại một xíu giúp nghe rõ hơn
      
      const bestVoice = getJapaneseVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const renderExampleWithHighlight = (example: string, kanji: string | undefined, reading: string | undefined) => {
    if (!example) return null;
    
    const targetKanji = kanji && example.includes(kanji) ? kanji : null;
    if (targetKanji) {
      const parts = example.split(targetKanji);
      return (
        <Fragment>
          “{parts.map((p, i) => (
            <Fragment key={i}>
              {p}
              {i < parts.length - 1 && <span className="text-theme-accent font-bold">{targetKanji}</span>}
            </Fragment>
          ))}”
        </Fragment>
      );
    }

    const kanjiChars = kanji ? kanji.match(/[\u4e00-\u9faf]+/g) : null;
    if (kanjiChars && kanjiChars.length > 0) {
      const stem = kanjiChars.join(''); // Try exactly first just in case
      let targetStem = stem;
      
      if (!example.includes(stem)) {
        // Just take the first kanji cluster if they don't appear together
        targetStem = kanjiChars[0];
      }
      
      if (example.includes(targetStem)) {
        const parts = example.split(targetStem);
        return (
          <Fragment>
            “{parts.map((p, i) => (
              <Fragment key={i}>
                {p}
                {i < parts.length - 1 && <span className="text-theme-accent font-bold">{targetStem}</span>}
              </Fragment>
            ))}”
          </Fragment>
        );
      }
    }

    const targetReading = reading && example.includes(reading) ? reading : null;
    if (targetReading) {
      const parts = example.split(targetReading);
      return (
        <Fragment>
          “{parts.map((p, i) => (
            <Fragment key={i}>
              {p}
              {i < parts.length - 1 && <span className="text-theme-accent font-bold">{targetReading}</span>}
            </Fragment>
          ))}”
        </Fragment>
      );
    }

    return <Fragment>“{example}”</Fragment>;
  };

  const totalGoal = dueCards.length * 3;
  const currentProgress = Object.values(successCounts).reduce((acc: number, count: number) => acc + Math.min(count, 3), 0) as number;
  const progressPercent = totalGoal > 0 ? (currentProgress / totalGoal) * 100 : 0;
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

  return (
    <div className="fixed inset-0 bg-theme-base-alt z-50 font-sans text-theme-primary">
      <div className="w-full h-full overflow-y-auto flex flex-col items-center p-4 sm:p-8">
        <div className="flex-1 shrink-0 min-h-0" />
      {isFreeStudy && (
        <div className="absolute top-0 left-0 w-full h-1 bg-theme-hover">
          <div className="h-full bg-theme-accent transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
        </div>
      )}

      <button 
        onClick={handleDelete}
        className="absolute top-6 left-6 p-2 text-red-500 opacity-50 hover:opacity-100 hover:text-red-400 transition-opacity flex items-center gap-2"
        title="Xóa từ vựng"
      >
        <Trash2 className="w-6 h-6 font-light" strokeWidth={1.5} />
        <span className="hidden sm:inline text-sm">Xóa</span>
      </button>

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-theme-primary opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-8 h-8 font-light" strokeWidth={1} />
      </button>

      {!isEditing && (
        <button 
          onClick={startEdit}
          className="absolute top-6 right-20 p-2 text-theme-primary opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"
          title="Sửa từ vựng"
        >
          <span className="hidden sm:inline text-sm">Sửa</span>
          <Edit3 className="w-6 h-6 font-light" strokeWidth={1.5} />
        </button>
      )}

      <div className="w-full max-w-2xl flex flex-col items-center my-auto shrink-0 py-12">
        {isEditing ? (
          <ReviewEditForm 
            editForm={editForm}
            setEditForm={setEditForm}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
        <div className="mb-6 w-full flex justify-between items-center opacity-50">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-theme-accent">Phiên học hiện tại</span>
            {isFreeStudy && (
              <div className="flex gap-1.5 opacity-80">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 bg-theme-accent transform rotate-45 ${i < currentCardProgress ? 'opacity-100' : 'opacity-20'}`} />
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-widest font-serif">
            {currentIndex + 1} / {reviewQueue.length}
          </span>
        </div>

        <div 
          className={`w-full aspect-[4/3] relative mb-10 ${!(isFreeStudy && exerciseType !== 'flip') ? 'cursor-pointer' : ''}`}
          style={{ perspective: 1000 }}
          onClick={() => {
            if (!(isFreeStudy && exerciseType !== 'flip')) {
              setShowAnswer(!showAnswer);
            }
          }}
        >
          <motion.div
            className="w-full h-full relative"
            animate={{ rotateY: showAnswer ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div 
              className={`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl overflow-y-auto p-4 sm:p-8 ${showAnswer ? 'pointer-events-none' : ''}`}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <div className="flex-1 shrink-0"></div>
              <div className="flex flex-col gap-4 items-center w-full py-4 shrink-0">
                <div className="flex flex-col items-center gap-6">
                  <h1 className="text-6xl sm:text-[140px] font-serif text-theme-primary leading-tight tracking-tighter text-center break-words max-w-full" style={{ fontFamily: 'serif' }}>{currentCard.kanji || currentCard.reading}</h1>
                  <button 
                    onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading)}
                    className="p-3 text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors rounded-full transition-transform active:scale-95"
                    title="Phát âm"
                  >
                    <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 font-light" strokeWidth={1.5} />
                  </button>
                </div>
                {!showAnswer && isFreeStudy && exerciseType !== 'flip' && (
                  <div className="text-theme-accent opacity-70 text-xs uppercase tracking-[0.2em] mt-4">
                    {exerciseType === 'mcq_meaning' ? 'Chọn Ý Nghĩa' : 'Chọn/Nhập Cách Đọc'}
                  </div>
                )}
              </div>
              <div className="flex-1 shrink-0"></div>
            </div>

            {/* Back */}
            <div 
              className={`absolute inset-0 flex flex-col bg-theme-panel border border-theme-subtle shadow-2xl ${!showAnswer ? 'pointer-events-none' : ''}`}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="absolute inset-0 overflow-y-auto flex flex-col p-6 pb-12 sm:p-8">
                <div className="flex-1 shrink-0"></div>
                <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full py-4 shrink-0">
                  <div className="flex flex-col items-center gap-4 mb-2 sm:mb-4">
                    <h2 className="text-4xl sm:text-6xl font-serif text-theme-primary opacity-80" style={{ fontFamily: 'serif' }}>{currentCard.kanji}</h2>
                  <button 
                    onClick={(e) => handleSpeak(e, currentCard.kanji || currentCard.reading)}
                    className="p-2 text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors rounded-full transition-transform active:scale-95"
                    title="Phát âm"
                  >
                    <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 font-light" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex flex-row gap-6 sm:gap-12 items-center justify-center w-full mb-2">
                  <div className="flex justify-end flex-1 flex-col items-end gap-1">
                    <p className="text-xl sm:text-3xl font-serif text-theme-accent italic tracking-wide text-right">{currentCard.reading}</p>
                    {currentCard.romaji && (
                      <p className="text-sm text-theme-primary opacity-50 italic text-right">{currentCard.romaji}</p>
                    )}
                  </div>
                  {currentCard.sinoVietnamese && (
                    <>
                      <div className="w-px h-8 sm:h-12 bg-theme-active flex-shrink-0"></div>
                      <div className="flex justify-start flex-1">
                        <p className="text-xl sm:text-3xl font-serif text-theme-accent uppercase tracking-widest">{currentCard.sinoVietnamese}</p>
                      </div>
                      </>
                  )}
                </div>

                {currentCard.wordType && (
                  <div className="text-[10px] sm:text-xs text-theme-primary opacity-50 bg-theme-hover px-3 py-1 rounded-sm border border-theme-subtle uppercase tracking-widest mt-2">{currentCard.wordType}</div>
                )}

                <div className="w-16 h-px bg-theme-active mx-auto my-2 sm:my-4 flex-shrink-0"></div>
                <h2 className="text-xl sm:text-4xl font-light uppercase tracking-widest text-theme-primary leading-tight break-words text-center px-4 max-w-full">{currentCard.meaning}</h2>
                { (currentCard.kanjiExplanation || currentCard.wordType) && (
                  <div className="mt-4 px-6 py-4 bg-theme-hover/50 border border-theme-subtle rounded text-sm sm:text-base text-theme-primary font-sans opacity-90 leading-relaxed text-center max-w-lg mx-auto whitespace-pre-wrap markdown-body">
                    <Markdown>{(currentCard.wordType ? `**Loại từ: ${currentCard.wordType}**\n\n` : "") + (currentCard.kanjiExplanation || "")}</Markdown>
                  </div>
                )}
                {currentCard.examples && currentCard.examples.length > 0 ? (
                  <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                    {currentCard.examples.map((ex, index) => (
                      <HighlightProvider key={ex.id}><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        <div className="w-full flex items-start gap-2 justify-between">
                          <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                            {renderExampleHighlight(ex.sentence, currentCard.kanji || currentCard.reading, [], currentCard)}
                          </p>
                          <button
                            onClick={(e) => handleSpeak(e, ex.sentence)}
                            className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-0 group-hover/ex:opacity-100 shrink-0 -mt-1"
                            title="Nghe câu ví dụ"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                        {(ex.reading || ex.romaji) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-theme-primary/60 font-serif w-full">
                            {ex.reading && <span className="opacity-80 italic"><RelatedHighlight text={ex.reading} type="hiragana" /></span>}
                            {ex.romaji && <span className="opacity-60 italic"><RelatedHighlight text={ex.romaji} type="romaji" /></span>}
                          </div>
                        )}
                        {ex.translation && (
                          <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                            <HighlightVietnamese text={ex.translation} />
                          </p>
                        )}
                      </div></HighlightProvider>
                    ))}
                  </div>
                ) : (
                  (currentCard.example || currentCard.exampleTranslation) && (
                    <div className="mt-6 flex flex-col items-stretch gap-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
                      <HighlightProvider><div className="w-full flex flex-col items-start gap-2 bg-theme-base-alt p-4 sm:p-5 border border-theme-subtle rounded-lg text-left shadow-sm group/ex relative">
                        {currentCard.example && (
                          <div className="w-full flex items-start gap-2 justify-between">
                            <p className="text-xl sm:text-2xl text-theme-primary opacity-90 leading-relaxed font-serif break-words">
                              {renderExampleHighlight(currentCard.example, currentCard.kanji || currentCard.reading, [], currentCard)}
                            </p>
                            <button
                              onClick={(e) => handleSpeak(e, currentCard.example!)}
                              className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-0 group-hover/ex:opacity-100 shrink-0 -mt-1"
                              title="Nghe câu ví dụ"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {currentCard.exampleTranslation && (
                          <p className="text-sm sm:text-base text-theme-accent opacity-90 leading-relaxed font-light mt-1 whitespace-pre-wrap border-t border-theme-subtle/50 pt-3 w-full">
                            <HighlightVietnamese text={currentCard.exampleTranslation} />
                          </p>
                        )}
                      </div></HighlightProvider>
                    </div>
                  )
                )}
                </div>
                <div className="flex-1 shrink-0"></div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="h-32 w-full">
          {!showAnswer ? (
            isFreeStudy && exerciseType !== 'flip' ? (
              exerciseType === 'typing_reading' ? (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full flex flex-col items-center gap-2"
                >
                  <div className="flex w-full gap-2 relative h-12">
                    <input 
                      type="text"
                      value={readingInput}
                      onChange={(e) => { setReadingInput(e.target.value); setInputError(false); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCheckReading(); }}
                      placeholder="Nhập Hiragana..."
                      className={`flex-1 bg-theme-hover border ${inputError ? 'border-red-500' : 'border-theme-accent/30 focus:border-theme-accent'} text-theme-primary px-4 py-2 focus:outline-none placeholder:opacity-40 text-center text-lg`}
                      autoFocus
                    />
                    <button 
                      onClick={handleCheckReading}
                      className="bg-theme-accent text-theme-inverted px-6 uppercase tracking-widest font-medium hover:bg-theme-accent-light transition-colors text-[11px]"
                    >
                      Kiểm tra
                    </button>
                  </div>
                  {inputError && (
                    <div className="w-full flex justify-between items-center px-2 py-1">
                      <span className="text-red-500 text-[10px] uppercase tracking-widest opacity-80">Đáp án chưa đúng</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full flex flex-col gap-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    {mcqOptions.map((opt, i) => {
                      const isWrong = inputError && wrongMcqOption === opt;
                      return (
                        <button 
                          key={i}
                          onClick={() => handleMcqSelect(opt)}
                          className={`bg-theme-hover border ${isWrong ? 'border-red-500 bg-red-500/10 text-red-100' : 'border-theme-subtle'} hover:border-theme-accent text-[15px] sm:text-sm text-theme-primary py-4 sm:py-3 px-4 text-center transition-colors tracking-wide`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {inputError && (
                    <div className="w-full flex justify-between items-center px-2 py-1">
                      <span className="text-red-500 text-[10px] uppercase tracking-widest opacity-80">Đáp án chưa đúng</span>
                    </div>
                  )}
                </motion.div>
              )
            ) : (
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => setShowAnswer(true)}
                className="w-full bg-theme-hover border border-theme-accent hover:bg-theme-accent hover:text-theme-inverted py-5 uppercase tracking-[0.2em] text-theme-accent text-[11px] transition-colors"
              >
                Xem đáp án
              </motion.button>
            )
          ) : isFreeStudy ? (
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`grid ${(inputError && exerciseType !== 'flip') ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-4 w-full`}
            >
              <button 
                onClick={handleFreeStudyForgot}
                className="flex flex-col items-center py-4 sm:py-5 bg-theme-hover border border-red-900/30 hover:border-red-500 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-red-500 mb-1">Cần ôn lại</span>
                <span className="text-xs sm:text-sm text-red-500 font-serif italic">Quên</span>
              </button>
              {!(inputError && exerciseType !== 'flip') && (
                <button 
                  onClick={handleFreeStudyRemember}
                  className="flex flex-col items-center py-4 sm:py-5 bg-theme-hover border border-theme-subtle hover:border-green-500 group transition-all"
                >
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-green-500 mb-1">Hoàn thành</span>
                  <span className="text-xs sm:text-sm text-green-500 font-serif italic">Đã nhớ</span>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-4 gap-2 sm:gap-4 w-full"
            >
              <button 
                onClick={() => handleGrade('forgot')}
                className="flex flex-col items-center py-4 sm:py-5 bg-theme-hover border border-red-900/30 hover:border-red-500 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-red-500 mb-1">Chưa Nhớ</span>
                <span className="text-xs sm:text-sm text-red-500 font-serif italic">Lặp lại</span>
              </button>
              <button 
                onClick={() => handleGrade('hard')}
                className="flex flex-col items-center py-4 sm:py-5 bg-theme-hover border border-theme-subtle hover:border-orange-400 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-orange-400 mb-1">Mơ Hồ</span>
                <span className="text-xs sm:text-sm text-orange-400 font-serif italic">Khó</span>
              </button>
              <button 
                onClick={() => handleGrade('good')}
                className="flex flex-col items-center py-4 sm:py-5 bg-theme-hover border border-theme-subtle hover:border-green-500 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-green-500 mb-1">Đã Nhớ</span>
                <span className="text-xs sm:text-sm text-green-500 font-serif italic">Tốt</span>
              </button>
              <button 
                onClick={() => handleGrade('easy')}
                className="flex flex-col items-center py-4 sm:py-5 bg-theme-hover border border-theme-accent/20 hover:border-theme-accent group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-blue-400 mb-1">Rất Dễ</span>
                <span className="text-xs sm:text-sm text-blue-400 font-serif italic">Dễ</span>
              </button>
            </motion.div>
          )}
        </div>
          </>
        )}
      </div>
        <div className="flex-1 shrink-0 min-h-0" />
      </div>
    </div>
  );
}
