import React, { useState } from 'react';
import { KanjiCard } from '../types';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShortStudySessionProps {
  queue: KanjiCard[];
  onExit: () => void;
  onUpdateCard: (id: string, updates: Partial<KanjiCard>) => void;
}

export default function ShortStudySession({ queue: initialQueue, onExit, onUpdateCard }: ShortStudySessionProps) {
  const [queue, setQueue] = useState<KanjiCard[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMeaningShown, setIsMeaningShown] = useState(false);

  if (queue.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 w-full flex flex-col items-center justify-center min-h-[60vh] text-center">
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

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleRemember = () => {
    const currentScore = currentWord.difficultScore ?? 0;
    // Phục hồi điểm nhanh hơn nếu bị âm quá sâu (giảm một nửa số âm + 1)
    const newScore = Math.min(0, Math.floor(currentScore / 2) + 1);
    
    onUpdateCard(currentWord.id, { difficultScore: newScore });
    
    // Loại bỏ thẻ vựng khỏi queue ngắn do đã nhớ
    const newQueue = [...queue];
    newQueue.splice(currentIndex, 1);
    
    setIsMeaningShown(false);
    if (newQueue.length === 0) {
      setQueue([]);
    } else {
      const nextIndex = currentIndex >= newQueue.length ? 0 : currentIndex;
      setCurrentIndex(nextIndex);
      setQueue(newQueue);
    }
  };

  const handleForgot = () => {
    onUpdateCard(currentWord.id, { difficultScore: (currentWord.difficultScore ?? 0) - 1 });
    setIsMeaningShown(false);
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 w-full flex flex-col items-center justify-center min-h-[60vh]">
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
        <motion.div 
           key={currentWord.id}
           initial={{ opacity: 0, y: 20, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -20, scale: 0.95 }}
           className="bg-theme-hover border border-theme-subtle p-8 md:p-12 rounded-lg w-full max-w-2xl text-center shadow-xl relative"
        >
          {currentWord.wordType && (
            <div className="text-xs text-theme-accent tracking-widest uppercase mb-4 font-bold opacity-80">{currentWord.wordType}</div>
          )}
          
          <div className="flex items-center justify-center gap-4 mb-6 relative group">
            <div className="text-6xl md:text-8xl font-serif text-theme-primary">
              {currentWord.kanji}
            </div>
            <button
              onClick={(e) => playAudio(e, currentWord.kanji || currentWord.reading)}
              className="absolute -right-12 p-3 text-theme-primary/30 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors opacity-0 group-hover:opacity-100"
              title="Nghe phát âm"
            >
              <Volume2 className="w-8 h-8" />
            </button>
          </div>
          
          {isMeaningShown ? (
            <div className="mt-8 space-y-6">
               <div className="flex flex-col items-center gap-1">
                 <div className="text-2xl text-theme-accent font-medium">{currentWord.reading}</div>
                 {currentWord.romaji && (
                   <div className="text-sm text-theme-primary opacity-50 italic">{currentWord.romaji}</div>
                 )}
               </div>
               <div className="text-xl text-theme-primary font-medium mt-2">{currentWord.meaning}</div>
               {currentWord.kanjiExplanation && (
                 <div className="mt-4 px-6 py-4 bg-theme-hover/50 border border-theme-subtle rounded text-sm text-theme-primary font-sans opacity-90 leading-relaxed max-w-lg mx-auto whitespace-pre-wrap">
                   {currentWord.kanjiExplanation}
                 </div>
               )}
               {currentWord.sinoVietnamese && (
                 <div className="text-sm text-theme-primary/60 mt-2 uppercase tracking-widest">{currentWord.sinoVietnamese}</div>
               )}
               {currentWord.example && (
                  <div className="text-theme-primary text-lg bg-theme-panel p-6 rounded border border-theme-subtle text-left mt-6 shadow-inner">
                    <p className="font-serif leading-relaxed">{currentWord.example}</p>
                    {currentWord.exampleTranslation && (
                      <p className="text-sm opacity-60 mt-2 italic">{currentWord.exampleTranslation}</p>
                    )}
                  </div>
               )}
            </div>
          ) : (
            <div className="mt-12">
               <button
                 onClick={() => setIsMeaningShown(true)}
                 className="bg-theme-active border border-theme-strong hover:bg-theme-active-alt hover:border-theme-accent text-theme-primary px-8 py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg"
               >
                 Hiện ý nghĩa
               </button>
            </div>
          )}

          {isMeaningShown && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
              <button
                 onClick={handleForgot}
                 className="flex-1 bg-theme-panel border border-red-500/30 text-red-500 hover:bg-red-500/10 px-6 py-4 rounded font-bold uppercase tracking-widest transition-all"
              >
                 Quên (-1)
              </button>
              <button
                 onClick={handleRemember}
                 className="flex-1 bg-theme-accent border border-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-6 py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#c5a059]/10"
              >
                 Nhớ (+1)
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
