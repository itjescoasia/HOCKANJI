import React, { Fragment, useState, useRef, useEffect } from 'react';
import { KanjiCard } from '../types';

const InteractiveWord: React.FC<{ text: string, status: 'good' | 'bad' | 'target' | 'new', card?: KanjiCard }> = ({ text, status, card }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  let colorClass = "text-theme-accent";
  if (status === 'good') colorClass = "text-green-500";
  if (status === 'bad') colorClass = "text-red-400";
  if (status === 'new') colorClass = "text-theme-primary/80";

  if (!card) {
    return <span className={`${colorClass} font-bold`}>{text}</span>;
  }

  return (
    <span className="relative inline-block" ref={containerRef}>
      <span 
        className={`${colorClass} font-bold cursor-pointer hover:underline border-b border-dashed border-current`}
        onClick={(e) => {
           e.stopPropagation();
           setIsOpen(!isOpen);
        }}
        title="Nhấn để xem nghĩa"
      >
        {text}
      </span>
      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] bg-theme-panel border border-theme-subtle rounded shadow-lg p-3 z-50 flex flex-col gap-1 text-left font-sans text-base whitespace-normal">
          <span className="flex items-end justify-between gap-3">
            <strong className="text-xl font-serif text-theme-primary leading-none">{card.kanji || card.reading}</strong>
            {card.sinoVietnamese && <span className="text-[10px] text-theme-accent uppercase tracking-wider mb-0.5">{card.sinoVietnamese}</span>}
          </span>
          {card.reading && card.kanji && (
            <span className="text-sm text-theme-primary/70">{card.reading} {card.romaji ? `(${card.romaji})` : ''}</span>
          )}
          <span className="text-sm text-theme-primary mt-1 border-t border-theme-subtle/50 pt-1">{card.meaning}</span>
        </span>
      )}
    </span>
  );
};

export const renderExampleHighlight = (example: string, targetWord: string, mainDeck?: KanjiCard[]) => {
  if (!example) return <Fragment>“{example}”</Fragment>;

  const uniqueWords = new Map<string, KanjiCard>();
  mainDeck?.forEach(card => {
    const wordStr = card.kanji || card.reading;
    if (!wordStr || wordStr.length === 0) return;
    
    let isMatch = example.includes(wordStr);
    
    if (!isMatch && card.kanji) {
      const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
      if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem) && example.includes(stem)) {
        isMatch = true;
      }
    }

    if (!isMatch && card.forms) {
      for (const form of card.forms) {
        if (form.value && example.includes(form.value)) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      if (!uniqueWords.has(wordStr)) {
        uniqueWords.set(wordStr, card);
      } else {
        const existing = uniqueWords.get(wordStr)!;
        const eScore = (existing.interval || 0) + (existing.repetition || 0);
        const cScore = (card.interval || 0) + (card.repetition || 0);
        if (cScore > eScore) {
          uniqueWords.set(wordStr, card);
        }
      }
    }
  });

  const deckWordsInExample = Array.from(uniqueWords.values()).sort((a, b) => {
    const aStr = a.kanji || a.reading;
    const bStr = b.kanji || b.reading;
    return bStr.length - aStr.length;
  });

  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' | 'new', card?: KanjiCard }[] = [
    { text: example, status: 'neutral' }
  ];

  deckWordsInExample.forEach(card => {
    const matchStrs: string[] = [];
    if (card.kanji) matchStrs.push(card.kanji);
    if (card.reading && card.reading !== card.kanji) matchStrs.push(card.reading);
    if (card.kanji) {
      // Remove trailing hiragana for verbs/adjectives
      const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
      if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem)) {
        matchStrs.push(stem);
      }
    }
    if (card.forms) {
      card.forms.forEach(f => {
        if (f.value && !matchStrs.includes(f.value)) {
          matchStrs.push(f.value);
        }
      });
    }
    // Sort by length descending to match longest possible string first
    matchStrs.sort((a, b) => b.length - a.length);
    
    let status: 'good' | 'bad' | 'neutral' | 'new' | 'target' = 'good';
    const rep = card.repetition || 0;
    const int = card.interval || 0;
    if (rep === 0 && int === 0) {
      status = 'new';
    } else if (rep === 0 || int === 0) {
      status = 'bad';
    }

    matchStrs.forEach(wordStr => {
      const newTokens: typeof tokens = [];
      tokens.forEach(token => {
        if (token.status !== 'neutral') {
          newTokens.push(token);
          return;
        }
        const parts = token.text.split(wordStr);
        parts.forEach((part, i) => {
          if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
          if (i < parts.length - 1) newTokens.push({ text: wordStr, status: status, card: card });
        });
      });
      tokens = newTokens;
    });
  });

  // Fallback for the targetWord of this intensive item
  let targetWordCard: KanjiCard | undefined = undefined;
  if (targetWord) {
     targetWordCard = mainDeck?.find(c => c.kanji === targetWord || c.reading === targetWord);
  }

  const newTokens: typeof tokens = [];
  tokens.forEach(token => {
    if (token.status !== 'neutral' || !targetWord) {
      newTokens.push(token);
      return;
    }
    
    let targetToHighlight = targetWord;
    
    if (!token.text.includes(targetWord)) {
       // Try removing trailing okurigana
       const stem = targetWord.replace(/[ぁ-ん]+$/, '');
       if (stem && stem !== targetWord && /[\u4e00-\u9faf々]/.test(stem) && token.text.includes(stem)) {
           targetToHighlight = stem;
       } else {
           const kanjiChars = targetWord.match(/[\u4e00-\u9faf]+/g);
           if (kanjiChars && kanjiChars.length > 0) {
               const justKanji = kanjiChars.join('');
               targetToHighlight = token.text.includes(justKanji) ? justKanji : kanjiChars[0];
           }
       }
    }

    if (token.text.includes(targetToHighlight)) {
      const parts = token.text.split(targetToHighlight);
      parts.forEach((part, i) => {
        if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
        if (i < parts.length - 1) newTokens.push({ text: targetToHighlight, status: 'target', card: targetWordCard });
      });
    } else {
      newTokens.push(token);
    }
  });
  tokens = newTokens;

  return (
    <Fragment>
      {tokens.map((t, i) => {
        if (t.status === 'neutral') return <Fragment key={i}>{t.text}</Fragment>;
        return <InteractiveWord key={i} text={t.text} status={t.status} card={t.card} />;
      })}
    </Fragment>
  );
};

