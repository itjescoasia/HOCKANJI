import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import { IntensiveExample, IntensiveWord } from '../types';

interface SentenceReviewProps {
  deck: IntensiveWord[];
  mode: 'JA_TO_VI' | 'VI_TO_JA';
  onClose: () => void;
}

interface ExampleWithWord extends IntensiveExample {
  word: string;
}

export const SentenceReview: React.FC<SentenceReviewProps> = ({ deck, mode, onClose }) => {
  const [examples, setExamples] = useState<ExampleWithWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    // Extract all examples from the deck
    const allExamples: ExampleWithWord[] = [];
    deck.forEach(word => {
      word.examples.forEach(ex => {
        if (ex.sentence && ex.translation) {
          allExamples.push({ ...ex, word: word.word });
        }
      });
    });

    // Shuffle examples
    for (let i = allExamples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allExamples[i], allExamples[j]] = [allExamples[j], allExamples[i]];
    }

    setExamples(allExamples);
  }, [deck]);

  if (examples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <p className="text-[#d4d4d4]/60 mb-6 font-serif text-lg">Chưa có câu ví dụ nào trong Chuyên đề.</p>
        <button
          onClick={onClose}
          className="border border-[#2a2a2a] hover:border-[#c5a059] text-[#c5a059] bg-[#121212] px-8 py-3 rounded-none uppercase tracking-[0.2em] text-xs transition-colors"
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

  const handleReveal = () => {
    setShowAnswer(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-[#d4d4d4]/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-[#c5a059]">
              Ôn tập câu: {mode === 'JA_TO_VI' ? 'Nhật -> Việt' : 'Việt -> Nhật'}
            </h2>
            <p className="text-xs text-[#d4d4d4]/50 mt-1">Câu {currentIndex + 1} / {examples.length}</p>
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
            <div className="bg-[#121212] border border-[#2a2a2a] p-8 sm:p-12 flex flex-col items-center text-center relative overflow-hidden group">
              <span className="absolute top-4 left-4 text-xs font-mono text-[#c5a059]/30">
                {mode === 'JA_TO_VI' ? 'NHẬT' : 'VIỆT'}
              </span>
              
              <div className="mb-8 mt-4">
                <p className={`font-serif leading-relaxed text-[#d4d4d4] ${mode === 'JA_TO_VI' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                  {questionText}
                </p>
                {mode === 'JA_TO_VI' && currentExample.reading && (
                   <p className="text-[#c5a059] opacity-80 mt-4 text-sm">{currentExample.reading}</p>
                )}
              </div>

              <div className={`w-full transition-all duration-300 ${showAnswer ? 'opacity-100 mt-4 border-t border-[#2a2a2a] pt-8' : 'opacity-0 h-0 overflow-hidden'}`}>
                <span className="text-xs font-mono text-[#c5a059]/30 mb-4 block uppercase">
                  {mode === 'JA_TO_VI' ? 'VIỆT' : 'NHẬT'}
                </span>
                <p className={`font-serif leading-relaxed text-[#c5a059] ${mode === 'VI_TO_JA' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                  {answerText}
                </p>
                {mode === 'VI_TO_JA' && currentExample.reading && (
                   <p className="text-[#d4d4d4]/60 mt-4 text-sm">{currentExample.reading}</p>
                )}
                {currentExample.romaji && (
                   <p className="text-[#d4d4d4]/40 mt-2 text-xs">{currentExample.romaji}</p>
                )}
                <div className="mt-6 pt-6 border-t border-[#2a2a2a]/50 text-xs text-[#d4d4d4]/40 flex gap-2 items-center justify-center">
                  <span>Từ vựng gốc:</span>
                  <strong className="text-[#d4d4d4]/70 font-serif text-sm">{currentExample.word}</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-4 border border-[#2a2a2a] text-[#d4d4d4]/60 hover:text-white hover:border-[#c5a059] disabled:opacity-30 transition-colors bg-[#121212]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={showAnswer ? handleNext : handleReveal}
            className="flex-1 max-w-[200px] border border-[#c5a059] text-[#121212] bg-[#c5a059] hover:bg-[#b08d4a] font-bold py-4 transition-colors uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2"
          >
            {showAnswer ? (
              <>Tiếp theo <ArrowRight className="w-4 h-4" /></>
            ) : (
              <><Eye className="w-4 h-4" /> Xem đáp án</>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-4 border border-[#2a2a2a] text-[#d4d4d4]/60 hover:text-white hover:border-[#c5a059] transition-colors bg-[#121212]"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
