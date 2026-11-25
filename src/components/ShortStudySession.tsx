import { playTTS , playAudioUrl} from '../utils/playTTS';
import { notify } from '../utils/feedback';
import React, { useState, useEffect } from 'react';
import { KanjiCard } from '../types';
import { ArrowLeft, Volume2, RotateCcw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShortStudySessionProps {
  queue: KanjiCard[];
  onExit: () => void;
  onUpdateCard: (id: string, updates: Partial<KanjiCard>) => void;
  onRecordReview?: (isCorrect: boolean) => void;
}

interface ShortStudyCardProps {
  key?: React.Key;
  currentWord: KanjiCard;
  onForgot: () => void;
  onRemember: () => void;
}

function ShortStudyCard({ currentWord, onForgot, onRemember }: ShortStudyCardProps) {
  const [flipDegree, setFlipDegree] = useState(0);
  const [copied, setCopied] = useState(false);
  const isMeaningShown = Math.abs(flipDegree / 180) % 2 === 1;

  const playAudio = (e: React.MouseEvent | null, text: string, audioUrl?: string | null) => {
    if (e) e.stopPropagation();
    if (audioUrl) {
      playAudioUrl(audioUrl, text);
      return;
    }
    if (text) playTTS(text);
  };

  const handleCopyWord = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetText = currentWord.kanji || currentWord.reading || '';
    if (targetText) {
      navigator.clipboard.writeText(targetText).then(() => {
        setCopied(true);
        notify.success(`Đã sao chép: ${targetText}`);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleFlip = () => {
    if (!isMeaningShown) {
      setFlipDegree(prev => prev + 180);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;

      if (!isMeaningShown && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        handleFlip();
      } else if (isMeaningShown && (e.key === '1' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        onForgot();
      } else if (isMeaningShown && (e.key === '2' || e.key === 'ArrowRight')) {
        e.preventDefault();
        onRemember();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        playAudio(null, currentWord.kanji || currentWord.reading, currentWord.audioUrl);
      } else if (e.key === 'c' || e.key === 'C') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          handleCopyWord();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMeaningShown, currentWord, onForgot, onRemember]);

  return (
    <motion.div
       initial={{ opacity: 0, y: 20, scale: 0.95 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       exit={{ opacity: 0, y: -20, scale: 0.95 }}
       className="w-full max-w-2xl relative"
    >
      <div 
        className={`w-full min-h-[290px] sm:min-h-[340px] sm:aspect-video mb-6 ${!isMeaningShown ? 'cursor-pointer' : ''}`} 
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
         <motion.div
            className="w-full h-full min-h-[290px] sm:min-h-[340px] relative"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipDegree }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
         >
            {/* Front */}
            <div 
              className={`absolute inset-0 bg-theme-hover border border-theme-subtle p-6 sm:p-8 md:p-12 rounded-lg flex flex-col items-center justify-center shadow-xl group ${isMeaningShown ? 'pointer-events-none' : ''}`}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(e, currentWord.kanji || currentWord.reading, currentWord.audioUrl);
                }}
                className="absolute top-4 left-4 p-2 rounded-lg text-theme-primary/70 hover:text-theme-accent bg-theme-base hover:bg-theme-panel border border-theme-subtle transition-colors cursor-pointer z-20"
                title="Nghe phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                <button
                  type="button"
                  onClick={handleCopyWord}
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                      : 'bg-theme-base hover:bg-theme-hover text-theme-primary/70 hover:text-theme-accent border-theme-subtle'
                  }`}
                  title="Sao chép từ vựng"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      <span className="text-[11px] font-bold">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {currentWord.wordType && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[11px] text-theme-accent tracking-widest uppercase font-bold max-w-[45%] truncate">{currentWord.wordType}</div>
              )}
              <div className="flex items-center justify-center gap-3 mb-4 max-w-full px-2">
                <div className="text-5xl sm:text-6xl md:text-8xl font-serif text-theme-primary text-center break-words max-w-full">
                  {currentWord.kanji}
                </div>
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-theme-muted whitespace-nowrap">
                Chạm để lật thẻ
              </div>
            </div>

            {/* Back */}
            <div 
              className={`absolute inset-0 bg-theme-hover border border-theme-subtle p-5 sm:p-6 md:p-10 rounded-lg flex flex-col items-center shadow-xl group overflow-y-auto custom-scrollbar ${!isMeaningShown ? 'pointer-events-none' : ''}`}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
               <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                 <button
                   type="button"
                   onClick={handleCopyWord}
                   className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                     copied
                       ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                       : 'bg-theme-base hover:bg-theme-hover text-theme-primary/70 hover:text-theme-accent border-theme-subtle'
                   }`}
                   title="Sao chép từ vựng"
                 >
                   {copied ? (
                     <>
                       <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                       <span className="text-[11px] font-bold">Đã chép</span>
                     </>
                   ) : (
                     <>
                       <Copy className="w-3.5 h-3.5" />
                       <span className="text-[11px]">Sao chép</span>
                     </>
                   )}
                 </button>
               </div>
               <div className="flex flex-col items-center gap-1 w-full mt-6 sm:mt-2">
                 <div className="flex items-center justify-center gap-2 flex-wrap">
                   <div className="text-2xl sm:text-3xl md:text-5xl text-theme-accent font-medium font-serif break-words text-center">{currentWord.reading}</div>
                   <button
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       playAudio(e, currentWord.reading || currentWord.kanji, currentWord.audioUrl);
                     }}
                     className="p-2 text-theme-primary/70 hover:text-theme-accent bg-theme-base hover:bg-theme-panel border border-theme-subtle rounded-full transition-colors cursor-pointer shrink-0"
                     title="Nghe phát âm"
                   >
                     <Volume2 className="w-5 h-5" />
                   </button>
                 </div>
                 {currentWord.romaji && (
                   <div className="text-sm text-theme-muted italic">{currentWord.romaji}</div>
                 )}
               </div>
               <div className="text-lg sm:text-xl text-theme-primary font-semibold mt-3 text-center break-words">{currentWord.meaning}</div>
               
               { (currentWord.kanjiExplanation || currentWord.wordType) && (
                 <div className="mt-3 px-4 sm:px-6 py-3 bg-theme-base/60 border border-theme-subtle rounded text-sm text-theme-primary font-sans leading-relaxed max-w-lg mx-auto whitespace-pre-wrap text-center w-full shrink-0">
                   {(currentWord.wordType ? `Loại từ: ${currentWord.wordType}\n\n` : "") + (currentWord.kanjiExplanation || "")}
                 </div>
               )}
               {currentWord.sinoVietnamese && (
                 <div className="text-sm text-theme-primary/75 mt-3 uppercase tracking-widest text-center shrink-0">{currentWord.sinoVietnamese}</div>
               )}
               {currentWord.example && (
                  <div className="text-theme-primary text-sm sm:text-base bg-theme-panel p-4 rounded border border-theme-subtle text-left mt-4 shadow-inner w-full max-w-lg shrink-0 mb-4">
                    <p className="font-serif leading-relaxed break-words">{currentWord.example}</p>
                    {currentWord.exampleTranslation && (
                      <p className="text-xs text-theme-muted mt-1 italic break-words">{currentWord.exampleTranslation}</p>
                    )}
                  </div>
               )}
               <div className="mt-auto pt-4 text-[10px] uppercase tracking-widest text-theme-muted w-full text-center shrink-0">
                 Chạm để lật thẻ
               </div>
            </div>
         </motion.div>
      </div>

      {!isMeaningShown && (
        <div className="flex justify-center mb-6">
           <button
             onClick={handleFlip}
             className="w-full sm:w-auto bg-theme-active border border-theme-strong hover:bg-theme-active-alt hover:border-theme-accent text-theme-primary px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg cursor-pointer"
           >
             Hiện ý nghĩa
           </button>
        </div>
      )}

      {isMeaningShown && (
        <div className="grid grid-cols-2 sm:flex sm:flex-row justify-center gap-3 sm:gap-4">
          <button 
             onClick={onForgot}
             className="flex-1 bg-theme-panel border border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-500/10 px-4 sm:px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all cursor-pointer"
          >
             Quên (-1)
          </button>
          <button 
             onClick={onRemember}
             className="flex-1 bg-theme-accent border border-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-4 sm:px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all shadow-lg cursor-pointer"
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onExit]);

  React.useEffect(() => {
    const handleTTSGenerated = (e: any) => {
      const { text, audioUrl } = e.detail;
      if (!text || !audioUrl) return;
      
      setQueue(prev => prev.map(card => {
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
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 min-h-[40px] px-2 text-theme-primary/60 hover:text-theme-accent transition-colors cursor-pointer"
          title="Thoát (Esc)"
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
