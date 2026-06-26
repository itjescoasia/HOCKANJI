import React, { Fragment } from 'react';
import { KanjiCard } from '../types';

export const renderExampleHighlight = (example: string, targetWord: string, mainDeck?: KanjiCard[]) => {
  if (!example) return <Fragment>“{example}”</Fragment>;

  const uniqueWords = new Map<string, KanjiCard>();
  mainDeck?.forEach(card => {
    const wordStr = card.kanji || card.reading;
    if (wordStr && wordStr.length > 0 && example.includes(wordStr)) {
      if (!uniqueWords.has(wordStr)) {
        uniqueWords.set(wordStr, card);
      } else {
        const existing = uniqueWords.get(wordStr)!;
        const eScore = existing.interval + existing.repetition;
        const cScore = card.interval + card.repetition;
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

  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' }[] = [
    { text: example, status: 'neutral' }
  ];

  deckWordsInExample.forEach(card => {
    const wordStr = card.kanji || card.reading;
    
    let status: 'good' | 'bad' | 'neutral' = 'good';
    if (card.repetition === 0 && card.interval === 0) {
      status = 'neutral';
    } else if (card.repetition === 0 || card.interval <= 1) {
      status = 'bad';
    }

    if (status !== 'neutral') {
      const newTokens: typeof tokens = [];
      tokens.forEach(token => {
        if (token.status !== 'neutral') {
          newTokens.push(token);
          return;
        }
        const parts = token.text.split(wordStr);
        parts.forEach((part, i) => {
          if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
          if (i < parts.length - 1) newTokens.push({ text: wordStr, status: status });
        });
      });
      tokens = newTokens;
    }
  });

  // Fallback for the targetWord of this intensive item
  const newTokens: typeof tokens = [];
  tokens.forEach(token => {
    if (token.status !== 'neutral' || !targetWord) {
      newTokens.push(token);
      return;
    }
    
    let targetToHighlight = targetWord;
    
    if (!token.text.includes(targetWord)) {
       const kanjiChars = targetWord.match(/[\u4e00-\u9faf]+/g);
       if (kanjiChars && kanjiChars.length > 0) {
           const stem = kanjiChars.join('');
           targetToHighlight = token.text.includes(stem) ? stem : kanjiChars[0];
       }
    }

    if (token.text.includes(targetToHighlight)) {
      const parts = token.text.split(targetToHighlight);
      parts.forEach((part, i) => {
        if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
        if (i < parts.length - 1) newTokens.push({ text: targetToHighlight, status: 'target' });
      });
    } else {
      newTokens.push(token);
    }
  });
  tokens = newTokens;

  return (
    <Fragment>
      {tokens.map((t, i) => {
        if (t.status === 'good') return <span key={i} className="text-green-500 font-bold" title="Từ này bạn đã nhớ (Tốt)">{t.text}</span>;
        if (t.status === 'bad') return <span key={i} className="text-red-400 font-bold" title="Từ này bạn cần học thêm (Khó / Lặp lại)">{t.text}</span>;
        if (t.status === 'target') return <span key={i} className="text-[#c5a059] font-bold">{t.text}</span>;
        return <Fragment key={i}>{t.text}</Fragment>;
      })}
    </Fragment>
  );
};
