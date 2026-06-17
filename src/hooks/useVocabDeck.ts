import { useState, useEffect } from 'react';
import { KanjiCard, ReviewGrade } from '../types';
import { calculateNextReview } from '../lib/sm2';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

export function useVocabDeck() {
  const [deck, setDeck] = useState<KanjiCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const defaultDeck: KanjiCard[] = [
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
    ];

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // User logged in, fetch from Firestore
        const q = query(collection(db, 'users', user.uid, 'kanjiDeck'));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const loadedDeck: KanjiCard[] = [];
          snapshot.forEach((docSnap) => {
            loadedDeck.push(docSnap.data() as KanjiCard);
          });
          setDeck(loadedDeck.sort((a,b) => b.createdAt - a.createdAt));
          setIsLoaded(true);
        }, (error) => {
          console.error("Firestore error:", error);
          setIsLoaded(true); // Don't block UI if error
        });

        return () => unsubscribeSnapshot();
      } else {
        // Not logged in, load from localStorage if possible (fallback)
        const stored = localStorage.getItem('kanji_srs_deck');
        if (stored) {
          try {
            setDeck(JSON.parse(stored));
          } catch (e) {}
        } else {
          setDeck(defaultDeck);
        }
        setIsLoaded(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync to localStorage as a backup when not authenticated
  useEffect(() => {
    if (isLoaded && !auth.currentUser) {
      localStorage.setItem('kanji_srs_deck', JSON.stringify(deck));
    }
  }, [deck, isLoaded]);

  const addCard = async (kanji: string, reading: string, meaning: string) => {
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

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', newCard.id), newCard);
      } catch (err) {
        console.error("Error adding card:", err);
      }
    } else {
      setDeck(prev => [newCard, ...prev]);
    }
  };

  const removeCard = async (id: string) => {
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id));
      } catch (err) {
        console.error("Error removing card:", err);
      }
    } else {
      setDeck(prev => prev.filter(c => c.id !== id));
    }
  };

  const reviewCard = async (id: string, grade: ReviewGrade) => {
    const cardToReview = deck.find(c => c.id === id);
    if (!cardToReview) return;

    const updatedCard = calculateNextReview(cardToReview, grade);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', updatedCard.id), updatedCard);
      } catch (err) {
        console.error("Error updating card:", err);
      }
    } else {
      setDeck(prev => prev.map(card => card.id === id ? updatedCard : card));
    }
  };

  const getDueCards = () => {
    const now = Date.now();
    return deck.filter(card => card.nextReviewDate <= now);
  };

  return { deck, addCard, removeCard, reviewCard, getDueCards, isLoaded };
}
