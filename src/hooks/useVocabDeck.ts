import { useState, useEffect } from 'react';
import { KanjiCard, ReviewGrade } from '../types';
import { calculateNextReview } from '../lib/sm2';

const STORAGE_KEY = 'kanji_srs_deck';

export function useVocabDeck() {
  const [deck, setDeck] = useState<KanjiCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDeck(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse deck", e);
      }
    } else {
      // Mock some initial data for demo?
      setDeck([
        {
          id: 'mock-1',
          kanji: '日',
          reading: 'nichi, hi',
          meaning: 'Mặt trời, Ngày',
          interval: 0,
          repetition: 0,
          easeFactor: 2.5,
          nextReviewDate: Date.now(),
          createdAt: Date.now() - 100000
        },
        {
          id: 'mock-2',
          kanji: '月',
          reading: 'getsu, tsuki',
          meaning: 'Mặt trăng, Tháng',
          interval: 0,
          repetition: 0,
          easeFactor: 2.5,
          nextReviewDate: Date.now(),
          createdAt: Date.now() - 50000
        }
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    }
  }, [deck, isLoaded]);

  const addCard = (kanji: string, reading: string, meaning: string) => {
    const newCard: KanjiCard = {
      id: crypto.randomUUID(),
      kanji,
      reading,
      meaning,
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
      createdAt: Date.now()
    };
    setDeck(prev => [...prev, newCard]);
  };

  const removeCard = (id: string) => {
    setDeck(prev => prev.filter(c => c.id !== id));
  };

  const reviewCard = (id: string, grade: ReviewGrade) => {
    setDeck(prev => prev.map(card => {
      if (card.id === id) {
        return calculateNextReview(card, grade);
      }
      return card;
    }));
  };

  const getDueCards = () => {
    const now = Date.now();
    return deck.filter(card => card.nextReviewDate <= now);
  };

  return { deck, addCard, removeCard, reviewCard, getDueCards, isLoaded };
}
