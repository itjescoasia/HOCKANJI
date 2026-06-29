import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import { IntensiveExample, IntensiveWord, KanjiCard } from '../types';
import { renderExampleHighlight } from '../utils/highlight';

interface SentenceReviewProps {
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  mode: 'JA_TO_VI' | 'VI_TO_JA';
  onClose: () => void;
  onUpdateWord?: (id: string, updates: Partial<IntensiveWord>) => void;
}

interface ExampleWithWord extends IntensiveExample {
  word: string;
  wordId: string;
}

export const SentenceReview: React.FC<SentenceReviewProps> = ({ deck, mainDeck, mode, onClose, onUpdateWord }) => {
  const [examples, setExamples] = useState<ExampleWithWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    // Extract all examples from the deck
    const allExamples: ExampleWithWord[] = [];
    deck.forEach(word => {
      word.examples.forEach(ex => {
        if (ex.sentence && ex.translation) {
          allExamples.push({ ...ex, word: word.word, wordId: word.id });
        }
      });
    });

    // Shuffle examples first to randomize within categories
    for (let i = allExamples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allExamples[i], allExamples[j]] = [allExamples[j], allExamples[i]];
    }

    // Sort so unmastered examples come first for the current mode
    allExamples.sort((a, b) => {
      const aMastered = mode === 'VI_TO_JA' ? a.viToJaMastered : a.jaToViMastered;
      const bMastered = mode === 'VI_TO_JA' ? b.viToJaMastered : b.jaToViMastered;
      
      // Fallback to legacy mastered if the new properties don't exist yet
      const finalAMastered = aMastered !== undefined ? aMastered : a.mastered;
      const finalBMastered = bMastered !== undefined ? bMastered : b.mastered;
      
      if (finalAMastered === finalBMastered) return 0;
      if (finalAMastered) return 1;
      return -1;
    });

    setExamples(allExamples);
    setIsInitialized(true);
  }, [deck, mode, isInitialized]);

  if (examples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <p className="text-theme-primary/60 mb-6 font-serif text-lg">Chưa có câu ví dụ nào trong Chuyên đề.</p>
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
  
  const questionText = mode === 'JA_TO_VI' ? currentExample.sentence : currentExample.translation;
  const answerText = mode === 'JA_TO_VI' ? currentExample.translation : currentExample.sentence;
  
  const handleNext = () => {
    setShowAnswer(false);
    if (currentIndex < examples.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setShowAnswer(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleGrade = (mastered: boolean) => {
    if (onUpdateWord) {
      const word = deck.find(w => w.id === currentExample.wordId);
      if (word) {
        const updatedExamples = word.examples.map(ex => {
          if (ex.id === currentExample.id) {
            return mode === 'VI_TO_JA' 
              ? { ...ex, viToJaMastered: mastered } 
              : { ...ex, jaToViMastered: mastered };
          }
          return ex;
        });
        onUpdateWord(word.id, { examples: updatedExamples });
      }
    }
    
    // Update local state to reflect the change immediately
    setExamples(prev => prev.map((ex, i) => {
      if (i === currentIndex) {
        return mode === 'VI_TO_JA' 
          ? { ...ex, viToJaMastered: mastered } 
          : { ...ex, jaToViMastered: mastered };
      }
      return ex;
    }));
    
    handleNext();
  };

  const handleReveal = () => {
    setShowAnswer(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between p-4 border-b border-theme-subtle">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-theme-primary/60 hover:text-theme-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-theme-accent">
              Ôn tập câu: {mode === 'JA_TO_VI' ? 'Nhật -> Việt' : 'Việt -> Nhật'}
            </h2>
            <p className="text-xs text-theme-primary/50 mt-1">Câu {currentIndex + 1} / {examples.length}</p>
          </div>
        </div>
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
            <div className="bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative overflow-hidden group">
              <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
                {mode === 'JA_TO_VI' ? 'NHẬT' : 'VIỆT'}
              </span>
              
              <div className="mb-8 mt-4">
                <p className={`font-serif leading-relaxed ${mode === 'JA_TO_VI' ? 'text-blue-100 text-2xl sm:text-3xl' : 'text-theme-primary text-xl sm:text-2xl'}`}>
                  {mode === 'JA_TO_VI' ? renderExampleHighlight(currentExample.sentence, currentExample.word, mainDeck) : questionText}
                </p>
                {mode === 'JA_TO_VI' && currentExample.reading && (
                   <p className="text-theme-accent opacity-80 mt-4 text-sm">{currentExample.reading}</p>
                )}
              </div>

              <div className={`w-full transition-all duration-300 ${showAnswer ? 'opacity-100 mt-4 border-t border-theme-subtle pt-8' : 'opacity-0 h-0 overflow-hidden'}`}>
                <span className="text-xs font-mono text-theme-accent/30 mb-4 block uppercase">
                  {mode === 'JA_TO_VI' ? 'VIỆT' : 'NHẬT'}
                </span>
                <p className={`font-serif leading-relaxed ${mode === 'VI_TO_JA' ? 'text-blue-100 text-2xl sm:text-3xl' : 'text-theme-accent text-xl sm:text-2xl'}`}>
                  {mode === 'VI_TO_JA' ? renderExampleHighlight(currentExample.sentence, currentExample.word, mainDeck) : answerText}
                </p>
                {mode === 'VI_TO_JA' && currentExample.reading && (
                   <p className="text-theme-primary/60 mt-4 text-sm">{currentExample.reading}</p>
                )}
                {currentExample.romaji && (
                   <p className="text-theme-primary/40 mt-2 text-xs">{currentExample.romaji}</p>
                )}
                <div className="mt-6 pt-6 border-t border-theme-subtle/50 text-xs text-theme-primary/40 flex gap-2 items-center justify-center">
                  <span>Từ vựng gốc:</span>
                  <strong className="text-theme-primary/70 font-serif text-sm">{currentExample.word}</strong>
                  {(() => {
                    const isMastered = mode === 'VI_TO_JA' ? currentExample.viToJaMastered : currentExample.jaToViMastered;
                    const finalIsMastered = isMastered !== undefined ? isMastered : currentExample.mastered;
                    
                    if (finalIsMastered !== undefined) {
                      return (
                        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${finalIsMastered ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {finalIsMastered ? (mode === 'VI_TO_JA' ? 'Nói được' : 'Đã nhớ') : (mode === 'VI_TO_JA' ? 'Chưa nói được' : 'Chưa nhớ')}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-4 border border-theme-subtle text-theme-primary/60 hover:text-theme-primary hover:border-theme-accent disabled:opacity-30 transition-colors bg-theme-panel"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {showAnswer ? (
            <div className="flex-1 flex gap-4 max-w-[400px]">
              <button
                onClick={() => handleGrade(false)}
                className="flex-1 border border-red-500/50 text-red-500 bg-theme-panel hover:bg-red-500/10 font-bold py-4 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                {mode === 'VI_TO_JA' ? 'Chưa nói được' : 'Chưa nhớ'}
              </button>
              <button
                onClick={() => handleGrade(true)}
                className="flex-1 border border-green-500 text-green-500 bg-theme-panel hover:bg-green-500/10 font-bold py-4 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                {mode === 'VI_TO_JA' ? 'Nói được' : 'Đã nhớ'}
              </button>
            </div>
          ) : (
            <button
              onClick={showAnswer ? handleNext : handleReveal}
              className="flex-1 max-w-[200px] border border-theme-accent text-theme-inverted bg-theme-accent hover:bg-theme-accent-hover font-bold py-4 transition-colors uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2"
            >
              {showAnswer ? (
                <>Tiếp theo <ArrowRight className="w-4 h-4" /></>
              ) : (
                <><Eye className="w-4 h-4" /> Xem đáp án</>
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
      </div>
    </div>
  );
};
