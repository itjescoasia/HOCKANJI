import React, { Fragment, useState, useRef, useEffect, useContext } from 'react';
export const HighlightContext = React.createContext<{
  hoveredCard: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null;
  setHoveredCard: (info: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null, force?: boolean) => void;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  onEditCard?: (card: KanjiCard) => void;
}>({
  hoveredCard: null,
  setHoveredCard: () => {},
  isLocked: false,
  setLocked: () => {},
});

export const HighlightProvider: React.FC<{ children: React.ReactNode, onEditCard?: (card: KanjiCard) => void }> = ({ children, onEditCard }) => {
  const [hoveredCard, setHoveredCardState] = useState<{ card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null>(null);
  const [isLocked, setLocked] = useState(false);
  
  const setHoveredCard = (info: any, force = false) => {
    if (isLocked && !force) return;
    setHoveredCardState(info);
  };
  
  return (
    <HighlightContext.Provider value={{ hoveredCard, setHoveredCard, isLocked, setLocked, onEditCard }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) {
      const clean = text.replace(/\*/g, '');
      return <Fragment>{clean}</Fragment>;
  }

  let cleanText = text;
  let manualMatch = { index: -1, length: 0, str: '' };
  const firstStar = text.indexOf('*');
  if (firstStar !== -1) {
      const secondStar = text.indexOf('*', firstStar + 1);
      if (secondStar !== -1) {
          const matchedPhrase = text.substring(firstStar + 1, secondStar);
          cleanText = text.substring(0, firstStar) + matchedPhrase + text.substring(secondStar + 1);
          manualMatch = { index: firstStar, length: matchedPhrase.length, str: matchedPhrase };
      }
  }

  let target = '';
  let index = 0;
  
  if (type === 'hiragana') {
    target = (hoveredCard.matchedForm && hoveredCard.matchedForm.reading) ? hoveredCard.matchedForm.reading : hoveredCard.card.reading;
    index = hoveredCard.index || 0;
  } else {
    target = (hoveredCard.matchedForm && hoveredCard.matchedForm.romaji) ? hoveredCard.matchedForm.romaji : hoveredCard.card.romaji;
    index = hoveredCard.index || 0;
  }

  if (!target) {
    return <Fragment>{cleanText}</Fragment>;
  }
  
  target = String(target || "").trim();
  let matchStr = target;
  let lowerText = cleanText.toLowerCase();
  
  if (!lowerText.includes(matchStr.toLowerCase())) {
    // Try prefix matching for conjugated verbs/adjectives
    let found = false;
    const minPrefixLength = type === 'hiragana' ? 2 : 3;
    for (let i = matchStr.length - 1; i >= Math.max(minPrefixLength, Math.floor(matchStr.length / 2)); i--) {
      const prefix = matchStr.substring(0, i);
      if (lowerText.includes(prefix.toLowerCase())) {
        if (type === 'hiragana') {
            const regex = new RegExp(`(${prefix}[ぁ-ん]*)`, 'i');
            const match = cleanText.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        } else if (type === 'romaji') {
            const regex = new RegExp(`(?:^|[^a-z])(${prefix}[a-z]*)`, 'i');
            const match = cleanText.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        }
        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found && manualMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
    }
  }

  if (manualMatch.index !== -1) {
      const before = cleanText.substring(0, manualMatch.index);
      const match = manualMatch.str;
      const after = cleanText.substring(manualMatch.index + manualMatch.length);
      return (
        <Fragment>
          {before}
          <span className="rounded transition-all duration-200 bg-theme-accent text-white shadow-sm relative">
            {match}
          </span>
          {after}
        </Fragment>
      );
  }

  // To prevent regex errors with special characters
  const safeMatchStr = matchStr.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeMatchStr})`, 'gi');
  const parts = cleanText.split(regex);
  let matchCount = 0;

  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === matchStr.toLowerCase()) {
          const isCurrentMatch = matchCount === index;
          matchCount++;
          return <span key={i} className={`rounded transition-colors duration-200 ${isCurrentMatch ? 'bg-theme-accent text-white shadow-sm relative z-10' : 'bg-theme-accent/20 text-theme-accent'}`}>{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );
};

import { KanjiCard } from '../types';
import { Volume2, Edit2 } from 'lucide-react';

const InteractiveWord: React.FC<{ text: string, status: 'good' | 'bad' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }> = ({ text, status, card, occurrenceIndex = 0, matchedForm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const { setHoveredCard, onEditCard, isLocked, setLocked } = useContext(HighlightContext);

  useEffect(() => {
    if (isOpen && card) {
      setLocked(true);
      setHoveredCard({ card, index: occurrenceIndex, matchedForm }, true);
    } else if (!isOpen && card) {
      // We only unlock if we are the one locking. But how do we know?
      // Actually, just setLocked(false). 
      // If another word is clicked, its onClick will fire.
      // mousedown on outside happens before the other word's onClick.
      // So setLocked(false) and then the other word's onClick sets isOpen=true and locks.
      setLocked(false);
      // We might want to setHoveredCard(null, true) when closed, to clear the lock.
      // But let's just unlock and let mouse leave handle clearing it if needed, or clear it.
      setHoveredCard(null, true);
    }
  }, [isOpen]);
  
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

  const playAudio = (e: React.MouseEvent, textToSpeak: string) => {
    e.stopPropagation();
    if (!textToSpeak || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  let colorClass = "text-theme-accent";
  if (status === 'good') colorClass = "text-green-500";
  if (status === 'bad') colorClass = "text-red-400";
  if (status === 'new') colorClass = "text-theme-primary/80";

  if (!card) {
    return <span className={`${colorClass} font-bold`}>{text}</span>;
  }

  return (
    <span className="relative inline-block" ref={containerRef} onMouseEnter={() => card && setHoveredCard({ card, index: occurrenceIndex, matchedForm })} onMouseLeave={() => setHoveredCard(null)} onClick={() => card && setHoveredCard({ card, index: occurrenceIndex, matchedForm })}>
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
          <span className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-2">
              <strong className="text-xl font-serif text-theme-primary leading-none">{card.kanji || card.reading}</strong>
              <button 
                onClick={(e) => playAudio(e, text)}
                className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0"
                title="Nghe phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {onEditCard && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); if (onEditCard) onEditCard(card); window.dispatchEvent(new CustomEvent('editCard', { detail: card })); }}
                  className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 ml-1"
                  title="Chỉnh sửa từ vựng"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </span>
            {card.sinoVietnamese && <span className="text-[10px] text-theme-accent uppercase tracking-wider mb-0.5 whitespace-nowrap">{card.sinoVietnamese}</span>}
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


export const HighlightVietnamese: React.FC<{ text: string }> = ({ text }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) {
      // If there are manual asterisks but no hover, we could just render without them,
      // but typically without hover we don't highlight. Let's just strip asterisks if no hover.
      const clean = text.replace(/\*/g, '');
      return <Fragment>{clean}</Fragment>;
  }

  // Check for manual *highlights* in Vietnamese text first
  let cleanText = text;
  let manualMatch = { index: -1, length: 0, str: '' };
  const firstStar = text.indexOf('*');
  if (firstStar !== -1) {
      const secondStar = text.indexOf('*', firstStar + 1);
      if (secondStar !== -1) {
          const matchedPhrase = text.substring(firstStar + 1, secondStar);
          cleanText = text.substring(0, firstStar) + matchedPhrase + text.substring(secondStar + 1);
          manualMatch = { index: firstStar, length: matchedPhrase.length, str: matchedPhrase };
      }
  }

  const card = hoveredCard.card;
  if (!card || !card.meaning) return <Fragment>{text}</Fragment>;

  let meanings = card.meaning.split(/[;,]/).map(s => String(s || "").trim()).filter(s => s.length > 0);
  
  if (hoveredCard.matchedForm && hoveredCard.matchedForm.meaning) {
    meanings = hoveredCard.matchedForm.meaning.split(/[;,]/).map(s => String(s || "").trim()).filter(s => s.length > 0);
  }
  
  let bestMatch = manualMatch;
  const lowerText = cleanText.toLowerCase();

  // 1. Exact match for each meaning segment
  if (manualMatch.index === -1) {
    meanings.forEach(m => {
      const lowerM = m.toLowerCase();
      const idx = lowerText.indexOf(lowerM);
      if (idx !== -1 && m.length > bestMatch.length) {
        bestMatch = { index: idx, length: m.length, str: cleanText.substring(idx, idx + m.length) };
      }
    });
  }

  // 2. Partial / word-sequence matching if no exact match is found
  if (bestMatch.index === -1 && manualMatch.index === -1) {
    meanings.forEach(m => {
      let lowerM = m.toLowerCase();
      // Remove common Vietnamese prefix words that might prevent a match
      const prefixes = ['sự ', 'niềm ', 'cái ', 'con ', 'việc ', 'làm ', 'người '];
      prefixes.forEach(p => {
        if (lowerM.startsWith(p)) lowerM = lowerM.substring(p.length);
      });
      
      const words = lowerM.split(/[\s\.\,\!\?]+/).filter(w => w.length > 0);
      
      // Try combinations of words from longest to shortest
      for (let numWords = words.length; numWords >= 1; numWords--) {
        for (let start = 0; start <= words.length - numWords; start++) {
          const phrase = words.slice(start, start + numWords).join(' ');
          
          // Skip very short single words
          if (phrase.length < 3 && numWords === 1) continue; 
          
          // Skip common stop words if it's a single word
          const ignoreWords = [
            'một', 'những', 'các', 'để', 'và', 'của', 'là', 'có', 'không', 
            'sự', 'niềm', 'việc', 'làm', 'cái', 'trong', 'trên', 'dưới', 
            'với', 'cho', 'vào', 'ra', 'ở', 'tại', 'thì', 'mà', 'như', 
            'đã', 'đang', 'sẽ', 'bị', 'được', 'người', 'nhà', 'khi'
          ];
          if (numWords === 1 && ignoreWords.includes(phrase)) continue;

          const safePhrase = phrase.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
          // Use Unicode letters and digits for word boundaries
          const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}])(${safePhrase})(?:[^\\p{L}\\p{N}]|$)`, 'giu');
          
          const matches = [...cleanText.matchAll(regex)];
          for (const match of matches) {
            if (match.index !== undefined) {
              const matchedStr = match[1];
              const exactIdx = cleanText.indexOf(matchedStr, match.index);
              if (exactIdx !== -1 && matchedStr.length > bestMatch.length) {
                bestMatch = { index: exactIdx, length: matchedStr.length, str: cleanText.substring(exactIdx, exactIdx + matchedStr.length) };
              }
            }
          }
        }
      }
    });
  }

  if (bestMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
  }

  const matchStr = bestMatch.str;
  const safeMatchStr = matchStr.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeMatchStr})`, 'gi');
  const parts = cleanText.split(regex);
  let matchCount = 0;
  const targetIndex = hoveredCard.index || 0;

  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === matchStr.toLowerCase()) {
          const isCurrentMatch = matchCount === targetIndex;
          matchCount++;
          return <span key={i} className={`rounded transition-colors duration-200 ${isCurrentMatch ? 'bg-theme-accent text-white shadow-sm relative z-10' : 'bg-theme-accent/20 text-theme-accent'}`}>{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );
};


const suffixes = [
  "させられませんでした", "させられません", "させられました", "させられる", "させられた", "させられて", "させられない",
  "させませんでした", "させません", "させました", "させます", "させる", "させた", "させて", "させない",
  "られませんでした", "られません", "られました", "られます", "られる", "られた", "られて", "られない",
  "れませんでした", "れません", "れました", "れます", "れる", "れた", "れて", "れない",
  "ませんでした", "ません", "ました", "ます", "ましょう",
  "しまいました", "しましょう", "しません", "しました", "します", "しまう", "しまった", "しまって",
  "いました", "いません", "います", "いる", "いた", "いて", "いない",
  "ありました", "ありません", "あります", "ある", "あった", "あって",
  "おきました", "おきません", "おきます", "おく", "おいた", "おいて", "おかない",
  "みました", "みません", "みます", "みる", "みた", "みて", "みない",
  "いきました", "いきません", "いきます", "いく", "いった", "いって", "いかない",
  "きました", "きません", "きます", "くる", "きた", "きて", "こない",
  "やすいです", "やすい", "やすかった", "やすく",
  "にくいです", "にくい", "にくかった", "にくく",
  "すぎます", "すぎました", "すぎません", "すぎる", "すぎた", "すぎて",
  "なさい", "なさいました", "なさいません", "なさる", "なさった", "なさって",
  "たいです", "たい", "たかった", "たく", "たくない", "たくありません", "たくなかった", "たくありませんでした",
  "たがります", "たがりました", "たがりません", "たがる", "たがった", "たがって",
  "かもしれない", "かもしれません",
  "でしょう", "だろう", "でしょうか",
  "らしいです", "らしい", "らしかった", "らしく",
  "そうです", "そう", "そうだった", "そうに", "そうな",
  "みたいです", "みたい", "みたいだった", "みたいに", "みたいな",
  "ではありません", "じゃありません", "ではない", "じゃない",
  "です", "でした", "だ", "だった",
  "から", "ので", "のに", "けれども", "けれど", "けど", "が", "と", "ば", "たら", "なら"
].sort((a, b) => b.length - a.length);

export function trimAuxiliary(text: string) {
  let changed = true;
  let result = text;
  while (changed) {
    changed = false;
    for (const suffix of suffixes) {
      if (result.endsWith(suffix) && result.length > suffix.length) {
        result = result.substring(0, result.length - suffix.length);
        changed = true;
        break;
      }
    }
  }
  return result;
}export const tokenizeExampleText = (example: string, targetWord: string, mainDeck?: KanjiCard[], fallbackTargetCard?: KanjiCard, vocabScores?: Record<string, number>) => {
  if (!example) return [];

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

  const deckWordsInExample = Array.from(uniqueWords.values());

  const allMatchCandidates: { matchStr: string, card: KanjiCard, isStem?: boolean, matchedForm?: any }[] = [];

  deckWordsInExample.forEach(card => {
    if (card.kanji) allMatchCandidates.push({ matchStr: card.kanji, card });
    if (card.reading && card.reading !== card.kanji) allMatchCandidates.push({ matchStr: card.reading, card });
    if (card.kanji) {
      // Remove trailing hiragana for verbs/adjectives if no forms are provided
      const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
      if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem)) {
        allMatchCandidates.push({ matchStr: stem, card, isStem: true });
      }
    }
    if (card.forms) {
      card.forms.forEach(f => {
        if (f.value) {
          allMatchCandidates.push({ matchStr: f.value, card, matchedForm: f });
        }
      });
    }
  });

  // Remove duplicates and sort globally by length descending
  const uniqueCandidates = Array.from(new Map(allMatchCandidates.map(c => [c.matchStr, c])).values());
  uniqueCandidates.sort((a, b) => b.matchStr.length - a.matchStr.length);

  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }[] = [];
  
  // Parse manual *highlights* first
  let currentExample = example;
  let nextAsterisk = currentExample.indexOf('*');
  while (nextAsterisk !== -1) {
    const endAsterisk = currentExample.indexOf('*', nextAsterisk + 1);
    if (endAsterisk !== -1) {
      if (nextAsterisk > 0) {
        tokens.push({ text: currentExample.substring(0, nextAsterisk), status: 'neutral' });
      }
      const markedText = currentExample.substring(nextAsterisk + 1, endAsterisk);
      tokens.push({ text: markedText, status: 'target', card: fallbackTargetCard });
      currentExample = currentExample.substring(endAsterisk + 1);
      nextAsterisk = currentExample.indexOf('*');
    } else {
      break;
    }
  }
  if (currentExample.length > 0) {
    tokens.push({ text: currentExample, status: 'neutral' });
  }

  // Fallback for the targetWord of this intensive item
  let targetWordCard: KanjiCard | undefined = undefined;
  if (targetWord) {
     targetWordCard = mainDeck?.find(c => c.kanji === targetWord || c.reading === targetWord) || fallbackTargetCard;
  }

  uniqueCandidates.forEach(({ matchStr, card, isStem, matchedForm }) => {
    let status: 'good' | 'bad' | 'neutral' | 'new' | 'target' = 'good';
    if (targetWord && (card.kanji === targetWord || card.reading === targetWord || card.id === targetWordCard?.id)) {
      status = 'target';
    } else if (vocabScores && vocabScores[card.id] !== undefined) {
      const score = vocabScores[card.id];
      if (score < 0) {
        status = 'bad';
      } else if (score > 0) {
        status = 'good';
      } else {
        status = 'new';
      }
    } else {
      const rep = card.repetition || 0;
      const int = card.interval || 0;
      if (rep === 0 && int === 0) {
        status = 'new';
      } else if (rep === 0 || int === 0) {
        status = 'bad';
      }
    }

    const newTokens: typeof tokens = [];
    tokens.forEach(token => {
      if (token.status !== 'neutral') {
        newTokens.push(token);
        return;
      }
      
      let currentText = token.text;
      let searchIndex = 0;
      
      while (currentText.length > 0) {
        const idx = currentText.indexOf(matchStr, searchIndex);
        if (idx === -1) {
          newTokens.push({ text: currentText, status: 'neutral' });
          break;
        }
        
        // If it's a stem, check if it's followed by another Kanji
        if (isStem) {
          const nextChar = currentText[idx + matchStr.length];
          if (nextChar && /[\u4e00-\u9faf々]/.test(nextChar)) {
            // Invalid match, skip and continue searching
            searchIndex = idx + 1;
            continue;
          }
        }
        
        // Valid match found!
        if (idx > 0) {
          newTokens.push({ text: currentText.substring(0, idx), status: 'neutral' });
        }
        
        let matchLen = matchStr.length;
        if (isStem) {
           // Consume trailing hiragana
           while (idx + matchLen < currentText.length) {
              const c = currentText[idx + matchLen];
              if (/[ぁ-ん]/.test(c)) {
                 matchLen++;
              } else {
                 break;
              }
           }
        }
        
        let actualMatchStr = matchStr;
        if (!matchedForm && !isStem) {
          actualMatchStr = trimAuxiliary(matchStr);
          if (!actualMatchStr) actualMatchStr = matchStr;
        }
        
        if (isStem) {
          actualMatchStr = currentText.substring(idx, idx + matchLen);
        }
        
        newTokens.push({ text: actualMatchStr, status, card, matchedForm });
        
        currentText = currentText.substring(idx + actualMatchStr.length);
        searchIndex = 0;
      }
    });
    tokens = newTokens;
  });

  

  const newTokens: typeof tokens = [];
  tokens.forEach(token => {
    if (token.status !== 'neutral' || !targetWord) {
      newTokens.push(token);
      return;
    }
    
    let targetToHighlight = trimAuxiliary(targetWord);
    if (!targetToHighlight) targetToHighlight = targetWord;
    
    if (!token.text.includes(targetToHighlight)) {
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

    if (targetToHighlight !== targetWord && targetToHighlight.length > 0 && token.text.includes(targetToHighlight)) {
      const safeStem = targetToHighlight.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(\${safeStem}[ぁ-ん]*)`, 'g');
      const parts = token.text.split(regex);
      parts.forEach((part) => {
        if (part.length > 0) {
          if (part.startsWith(targetToHighlight)) {
            let trimmed = trimAuxiliary(part);
            if (!trimmed) trimmed = part;
            newTokens.push({ text: trimmed, status: 'target', card: targetWordCard });
            const remainder = part.substring(trimmed.length);
            if (remainder.length > 0) {
              newTokens.push({ text: remainder, status: 'neutral' });
            }
          } else {
            newTokens.push({ text: part, status: 'neutral' });
          }
        }
      });

    } else if (token.text.includes(targetToHighlight)) {
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

  const cardCounts = new Map<string, number>();
  tokens.forEach(token => {
    if (token.card) {
      const key = token.card.id || token.text;
      const count = cardCounts.get(key) || 0;
      token.occurrenceIndex = count;
      cardCounts.set(key, count + 1);
    }
  });

  return tokens;
};

export const renderExampleHighlight = (example: string, targetWord: string, mainDeck?: KanjiCard[], fallbackTargetCard?: KanjiCard, vocabScores?: Record<string, number>) => {
  if (!example) return <Fragment>“{example}”</Fragment>;
  const tokens = tokenizeExampleText(example, targetWord, mainDeck, fallbackTargetCard, vocabScores);
  
  return (
    <Fragment>
      {tokens.map((t, i) => {
        if (t.status === 'neutral') return <Fragment key={i}>{t.text}</Fragment>;
        return <InteractiveWord key={i} text={t.text} status={t.status} card={t.card} occurrenceIndex={t.occurrenceIndex} matchedForm={t.matchedForm} />;
      })}
    </Fragment>
  );
};

