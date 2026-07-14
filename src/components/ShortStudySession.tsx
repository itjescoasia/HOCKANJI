import React, { useState } from 'react';
import { KanjiCard } from '../types';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShortStudySessionProps {
  queue: KanjiCard[];
  onExit: () => void;
  onUpdateCard: (id: string, updates: Partial<KanjiCard>) => void;
  onRecordReview?: (isCorrect: boolean) => void;
}

interface ShortStudyCardProps {
  currentWord: KanjiCard;
  onForgot: () => void;
  onRemember: () => void;
}

function ShortStudyCard({ currentWord, onForgot, onRemember }: ShortStudyCardProps) {
  const [flipDegree, setFlipDegree] = useState(0);
  const isMeaningShown = Math.abs(flipDegree / 180) % 2 === 1;

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setFlipDegree(prev => prev + 180);
  };

  return (
    <motion.div
       initial={{ opacity: 0, y: 20, scale: 0.95 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       exit={{ opacity: 0, y: -20, scale: 0.95 }}
       className="w-full max-w-2xl relative"
    >
      <div 
        className="w-full aspect-[4/3] sm:aspect-video cursor-pointer mb-6" 
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
         <motion.div
            className="w-full h-full relative"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipDegree }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
         >
            {/* Front */}
            <div 
              className={`absolute inset-0 bg-theme-hover border border-theme-subtle p-8 md:p-12 rounded-lg flex flex-col items-center justify-center shadow-xl group ${isMeaningShown ? 'pointer-events-none' : ''}`}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              {currentWord.wordType && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-theme-accent tracking-widest uppercase mb-4 font-bold opacity-80">{currentWord.wordType}</div>
              )}
              <div className="flex items-center justify-center gap-4 mb-6 relative">
                <div className="text-6xl md:text-8xl font-serif text-theme-primary">
                  {currentWord.kanji}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(e, currentWord.kanji || currentWord.reading);
                  }}
                  className="absolute -right-12 p-3 text-theme-primary/30 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-8 h-8" />
                </button>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest opacity-40">
                Chạm để lật thẻ
              </div>
            </div>

            {/* Back */}
            <div 
              className={`absolute inset-0 bg-theme-hover border border-theme-subtle p-6 md:p-10 rounded-lg flex flex-col items-center shadow-xl group overflow-y-auto custom-scrollbar ${!isMeaningShown ? 'pointer-events-none' : ''}`}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
               <div className="flex flex-col items-center gap-1 w-full mt-2">
                 <div className="flex items-center gap-2">
                   <div className="text-3xl md:text-5xl text-theme-accent font-medium font-serif">{currentWord.reading}</div>
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       playAudio(e, currentWord.reading || currentWord.kanji);
                     }}
                     className="p-2 text-theme-primary/30 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors opacity-0 group-hover:opacity-100"
                     title="Nghe phát âm"
                   >
                     <Volume2 className="w-6 h-6" />
                   </button>
                 </div>
                 {currentWord.romaji && (
                   <div className="text-sm text-theme-primary opacity-50 italic">{currentWord.romaji}</div>
                 )}
               </div>
               <div className="text-xl text-theme-primary font-medium mt-3 text-center">{currentWord.meaning}</div>
               
               {currentWord.kanjiExplanation && (
                 <div className="mt-3 px-6 py-3 bg-theme-base/50 border border-theme-subtle rounded text-sm text-theme-primary font-sans opacity-90 leading-relaxed max-w-lg mx-auto whitespace-pre-wrap text-center w-full shrink-0">
                   {currentWord.kanjiExplanation}
                 </div>
               )}
               {currentWord.sinoVietnamese && (
                 <div className="text-sm text-theme-primary/60 mt-3 uppercase tracking-widest text-center shrink-0">{currentWord.sinoVietnamese}</div>
               )}
               {currentWord.example && (
                  <div className="text-theme-primary text-base bg-theme-panel p-4 rounded border border-theme-subtle text-left mt-4 shadow-inner w-full max-w-lg shrink-0 mb-4">
                    <p className="font-serif leading-relaxed">{currentWord.example}</p>
                    {currentWord.exampleTranslation && (
                      <p className="text-xs opacity-60 mt-1 italic">{currentWord.exampleTranslation}</p>
                    )}
                  </div>
               )}
               <div className="mt-auto pt-4 text-[10px] uppercase tracking-widest opacity-40 w-full text-center shrink-0">
                 Chạm để lật thẻ
               </div>
            </div>
         </motion.div>
      </div>

      {!isMeaningShown && (
        <div className="flex justify-center mb-6">
           <button
             onClick={handleFlip}
             className="bg-theme-active border border-theme-strong hover:bg-theme-active-alt hover:border-theme-accent text-theme-primary px-8 py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg"
           >
             Hiện ý nghĩa
           </button>
        </div>
      )}

      {isMeaningShown && (
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
             onClick={onForgot}
             className="flex-1 bg-theme-panel border border-red-500/30 text-red-500 hover:bg-red-500/10 px-6 py-4 rounded font-bold uppercase tracking-widest transition-all"
          >
             Quên (-1)
          </button>
          <button 
             onClick={onRemember}
             className="flex-1 bg-theme-accent border border-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-6 py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#c5a059]/10"
          >
             Nhớ (+1)
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function ShortStudySession({ queue: initialQueue, onExit, onUpdateCard, onRecordReview }: ShortStudySessionProps) {
  const [queue, setQueue] = useState<KanjiCard[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (queue.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 sm:py-20 px-2 sm:px-4 w-full flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-serif text-theme-accent mb-4">Hoàn thành học ngắn!</h2>
        <p className="text-theme-primary/60 mb-8">Bạn đã nhớ được tất cả các từ trong danh sách học ngắn.</p>
        <button
          onClick={onExit}
          className="bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-8 py-3 rounded font-bold uppercase tracking-widest transition-all"
        >
          Trở về trang chủ
        </button>
      </div>
    );
  }

  const currentWord = queue[currentIndex];

  const handleRemember = () => {
    if (onRecordReview) onRecordReview(true);
    const currentScore = currentWord.difficultScore ?? 0;
    // Phục hồi điểm nhanh hơn nếu bị âm quá sâu (giảm một nửa số âm + 1)
    const newScore = Math.min(0, Math.floor(currentScore / 2) + 1);
    
    onUpdateCard(currentWord.id, { difficultScore: newScore });
    
    // Loại bỏ thẻ vựng khỏi queue ngắn do đã nhớ
    const newQueue = [...queue];
    newQueue.splice(currentIndex, 1);
    
    if (newQueue.length === 0) {
      setQueue([]);
    } else {
      const nextIndex = currentIndex >= newQueue.length ? 0 : currentIndex;
      setCurrentIndex(nextIndex);
      setQueue(newQueue);
    }
  };

  const handleForgot = () => {
    if (onRecordReview) onRecordReview(false);
    onUpdateCard(currentWord.id, { difficultScore: (currentWord.difficultScore ?? 0) - 1 });
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full flex justify-between items-center mb-8">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 text-theme-primary/60 hover:text-theme-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wider uppercase">Thoát</span>
        </button>
        <div className="text-theme-primary/60 text-sm font-medium tracking-wider uppercase bg-theme-hover px-3 py-1 rounded">
          Còn lại {queue.length} từ
        </div>
      </div>

      <AnimatePresence mode="wait">
        <ShortStudyCard 
          key={currentWord.id}
          currentWord={currentWord}
          onForgot={handleForgot}
          onRemember={handleRemember}
        />
      </AnimatePresence>
    </div>
  );
}
