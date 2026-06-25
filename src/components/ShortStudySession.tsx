import React, { useState } from 'react';
import { KanjiCard } from '../types';
import { ArrowLeft } from 'lucide-react';
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
        <h2 className="text-3xl font-serif text-[#c5a059] mb-4">Hoàn thành học ngắn!</h2>
        <p className="text-[#d4d4d4]/60 mb-8">Bạn đã nhớ được tất cả các từ trong danh sách học ngắn.</p>
        <button
          onClick={onExit}
          className="bg-[#c5a059] hover:bg-[#b08d4a] text-[#121212] px-8 py-3 rounded font-bold uppercase tracking-widest transition-all"
        >
          Trở về trang chủ
        </button>
      </div>
    );
  }

  const currentWord = queue[currentIndex];

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
          className="flex items-center gap-2 text-[#d4d4d4]/60 hover:text-[#c5a059] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wider uppercase">Thoát</span>
        </button>
        <div className="text-[#d4d4d4]/60 text-sm font-medium tracking-wider uppercase bg-[#1a1a1a] px-3 py-1 rounded">
          Còn lại {queue.length} từ
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
           key={currentWord.id}
           initial={{ opacity: 0, y: 20, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -20, scale: 0.95 }}
           className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 md:p-12 rounded-lg w-full max-w-2xl text-center shadow-xl relative"
        >
          {currentWord.wordType && (
            <div className="text-xs text-[#c5a059] tracking-widest uppercase mb-4 font-bold opacity-80">{currentWord.wordType}</div>
          )}
          
          <div className="text-6xl md:text-8xl font-serif text-white mb-6">
            {currentWord.kanji}
          </div>
          
          {isMeaningShown ? (
            <div className="mt-8 space-y-6">
               <div className="flex flex-col items-center gap-1">
                 <div className="text-2xl text-[#c5a059] font-medium">{currentWord.reading}</div>
                 {currentWord.romaji && (
                   <div className="text-sm text-[#d4d4d4] opacity-50 italic">{currentWord.romaji}</div>
                 )}
               </div>
               <div className="text-xl text-[#d4d4d4] font-medium mt-2">{currentWord.meaning}</div>
               {currentWord.kanjiExplanation && (
                 <div className="mt-4 px-6 py-4 bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded text-sm text-[#d4d4d4] font-sans opacity-90 leading-relaxed max-w-lg mx-auto whitespace-pre-wrap">
                   {currentWord.kanjiExplanation}
                 </div>
               )}
               {currentWord.sinoVietnamese && (
                 <div className="text-sm text-[#d4d4d4]/60 mt-2 uppercase tracking-widest">{currentWord.sinoVietnamese}</div>
               )}
               {currentWord.example && (
                  <div className="text-[#d4d4d4] text-lg bg-[#121212] p-6 rounded border border-[#2a2a2a] text-left mt-6 shadow-inner">
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
                 className="bg-[#2a2a2a] border border-[#3a3a3a] hover:bg-[#333333] hover:border-[#c5a059] text-white px-8 py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg"
               >
                 Hiện ý nghĩa
               </button>
            </div>
          )}

          {isMeaningShown && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
              <button
                 onClick={handleForgot}
                 className="flex-1 bg-[#121212] border border-red-500/30 text-red-500 hover:bg-red-500/10 px-6 py-4 rounded font-bold uppercase tracking-widest transition-all"
              >
                 Quên (-1)
              </button>
              <button
                 onClick={handleRemember}
                 className="flex-1 bg-[#c5a059] border border-[#c5a059] hover:bg-[#b08d4a] text-[#121212] px-6 py-4 rounded font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#c5a059]/10"
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
