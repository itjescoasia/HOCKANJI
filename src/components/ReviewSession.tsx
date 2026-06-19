import { useState } from 'react';
import { KanjiCard, ReviewGrade } from '../types';
import { motion } from 'motion/react';
import { X, Trash2 } from 'lucide-react';

interface ReviewSessionProps {
  dueCards: KanjiCard[];
  onReview: (id: string, grade: ReviewGrade) => void;
  onClose: () => void;
  onRemoveCard: (id: string) => void;
  isFreeStudy?: boolean;
}

export default function ReviewSession({ dueCards, onReview, onClose, onRemoveCard, isFreeStudy = false }: ReviewSessionProps) {
  const [reviewQueue, setReviewQueue] = useState<KanjiCard[]>(dueCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (currentIndex >= reviewQueue.length) {
    return (
      <div className="fixed inset-0 bg-[#0c0c0c]/95 flex flex-col items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#121212] border border-[#2a2a2a] p-12 text-center max-w-md w-full shadow-2xl"
        >
          <div className="w-16 h-16 border border-[#c5a059] text-[#c5a059] flex items-center justify-center mx-auto mb-8 bg-[#1a1a1a]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-serif text-[#c5a059] mb-4 tracking-widest uppercase">Hoàn Tất Phiên Học</h2>
          <p className="text-[#d4d4d4] opacity-50 mb-10 text-sm leading-relaxed tracking-wide">Tuyệt vời. Bạn đã hoàn thành tất cả các từ cần ôn cho hôm nay. Sự kiên trì sẽ tạo nên sự thành thạo.</p>
          <button 
            onClick={onClose}
            className="w-full bg-[#1a1a1a] border border-[#c5a059] hover:bg-[#c5a059] hover:text-black text-[#c5a059] font-medium py-4 uppercase tracking-[0.2em] text-[11px] transition-colors"
          >
            Trở lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  const currentCard = reviewQueue[currentIndex];

  const handleGrade = (grade: ReviewGrade) => {
    onReview(currentCard.id, grade);
    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleFreeStudyRemember = () => {
    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleFreeStudyForgot = () => {
    setReviewQueue(prev => [...prev, currentCard]);
    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
      onRemoveCard(currentCard.id);
      setReviewQueue(prev => prev.filter((_, i) => i !== currentIndex));
      setShowAnswer(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0c0c0c] flex flex-col items-center justify-center z-50 p-4 font-sans text-[#d4d4d4]">
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
        className="absolute top-6 right-6 p-2 text-[#d4d4d4] opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-8 h-8 font-light" strokeWidth={1} />
      </button>

      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="mb-8 w-full flex justify-between items-center opacity-50">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">Phiên học hiện tại</span>
          <span className="text-[10px] uppercase tracking-widest font-serif">
            {currentIndex + 1} / {reviewQueue.length}
          </span>
        </div>

        <div 
          className="w-full aspect-[4/3] bg-[#121212] border border-[#2a2a2a] relative shadow-2xl flex flex-col items-center justify-center p-8 mb-10 cursor-pointer"
          style={{ perspective: 1000 }}
          onClick={() => !showAnswer && setShowAnswer(true)}
        >
          <motion.div
            className="w-full h-full relative"
            animate={{ rotateX: showAnswer ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div 
              className={`absolute inset-0 flex items-center justify-center bg-[#121212] overflow-y-auto p-4 ${showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h1 className="text-6xl sm:text-[140px] font-serif text-white leading-tight tracking-tighter text-center break-words max-w-full" style={{ fontFamily: 'serif' }}>{currentCard.kanji}</h1>
            </div>

            {/* Back */}
            <div 
              className={`absolute inset-0 flex flex-col items-center justify-center bg-[#121212] ${!showAnswer ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
            >
              <div className="absolute inset-0 overflow-y-auto flex flex-col items-center justify-center p-6 pb-12 sm:p-8 space-y-4 sm:space-y-6">
                <h2 className="text-4xl sm:text-6xl font-serif text-white opacity-80 mb-2 sm:mb-4" style={{ fontFamily: 'serif' }}>{currentCard.kanji}</h2>
                <div className="flex flex-row gap-6 sm:gap-12 items-center justify-center w-full mb-2">
                  <div className="flex justify-end flex-1">
                    <p className="text-xl sm:text-3xl font-serif text-[#c5a059] italic tracking-wide text-right">{currentCard.reading}</p>
                  </div>
                  {currentCard.sinoVietnamese && (
                    <>
                      <div className="w-px h-8 sm:h-12 bg-[#2a2a2a] flex-shrink-0"></div>
                      <div className="flex justify-start flex-1">
                        <p className="text-xl sm:text-3xl font-serif text-[#c5a059] uppercase tracking-widest">{currentCard.sinoVietnamese}</p>
                      </div>
                    </>
                  )}
                </div>

                {currentCard.wordType && (
                  <div className="text-[10px] sm:text-xs text-[#d4d4d4] opacity-50 bg-[#1a1a1a] px-3 py-1 rounded-sm border border-[#2a2a2a] uppercase tracking-widest mt-2">{currentCard.wordType}</div>
                )}

                <div className="w-16 h-px bg-[#2a2a2a] mx-auto my-2 sm:my-4 flex-shrink-0"></div>
                <h2 className="text-xl sm:text-4xl font-light uppercase tracking-widest text-white leading-tight break-words text-center px-4 max-w-full">{currentCard.meaning}</h2>
                {(currentCard.example || currentCard.exampleTranslation) && (
                  <div className="mt-4 flex flex-col items-center gap-1">
                    {currentCard.example && (
                      <p className="text-sm sm:text-base text-[#d4d4d4] opacity-70 text-center max-w-md px-4 leading-relaxed font-light">
                        “{currentCard.example}”
                      </p>
                    )}
                    {currentCard.exampleTranslation && (
                      <p className="text-sm sm:text-base text-[#c5a059] opacity-70 text-center max-w-md px-4 leading-relaxed font-light italic">
                        {currentCard.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex items-center gap-2 opacity-30 bg-[#121212] px-2">
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase">Độ Khó: {currentCard.easeFactor.toFixed(2)}</span>
                <span>|</span>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase italic font-serif">Chu Kỳ: {currentCard.interval} ngày</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="h-32 w-full">
          {!showAnswer ? (
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => setShowAnswer(true)}
              className="w-full bg-[#1a1a1a] border border-[#c5a059] hover:bg-[#c5a059] hover:text-black py-5 uppercase tracking-[0.2em] text-[#c5a059] text-[11px] transition-colors"
            >
              Xem đáp án
            </motion.button>
          ) : isFreeStudy ? (
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-2 gap-2 sm:gap-4 w-full"
            >
              <button 
                onClick={handleFreeStudyForgot}
                className="flex flex-col items-center py-4 sm:py-5 bg-[#1a1a1a] border border-red-900/30 hover:border-red-500 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-red-500 mb-1">Cần ôn lại</span>
                <span className="text-xs sm:text-sm text-red-500 font-serif italic">Quên</span>
              </button>
              <button 
                onClick={handleFreeStudyRemember}
                className="flex flex-col items-center py-4 sm:py-5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-green-500 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-green-500 mb-1">Đã thuộc</span>
                <span className="text-xs sm:text-sm text-green-500 font-serif italic">Nhớ</span>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-4 gap-2 sm:gap-4 w-full"
            >
              <button 
                onClick={() => handleGrade('forgot')}
                className="flex flex-col items-center py-4 sm:py-5 bg-[#1a1a1a] border border-red-900/30 hover:border-red-500 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-red-500 mb-1">Chưa Nhớ</span>
                <span className="text-xs sm:text-sm text-red-500 font-serif italic">Lặp lại</span>
              </button>
              <button 
                onClick={() => handleGrade('hard')}
                className="flex flex-col items-center py-4 sm:py-5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-orange-400 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-orange-400 mb-1">Mơ Hồ</span>
                <span className="text-xs sm:text-sm text-orange-400 font-serif italic">Khó</span>
              </button>
              <button 
                onClick={() => handleGrade('good')}
                className="flex flex-col items-center py-4 sm:py-5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-green-500 group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-green-500 mb-1">Đã Nhớ</span>
                <span className="text-xs sm:text-sm text-green-500 font-serif italic">Tốt</span>
              </button>
              <button 
                onClick={() => handleGrade('easy')}
                className="flex flex-col items-center py-4 sm:py-5 bg-[#1a1a1a] border border-[#c5a059]/20 hover:border-[#c5a059] group transition-all"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-80 group-hover:text-blue-400 mb-1">Rất Dễ</span>
                <span className="text-xs sm:text-sm text-blue-400 font-serif italic">Dễ</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
