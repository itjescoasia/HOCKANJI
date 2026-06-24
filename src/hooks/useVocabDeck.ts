import { useState, useEffect } from 'react';
import { KanjiCard, ReviewGrade } from '../types';
import { calculateNextReview } from '../lib/sm2';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch } from 'firebase/firestore';
import { getEndOfTodayTimestamp } from '../lib/dateUtils';

export function useVocabDeck() {
  const [deck, setDeck] = useState<KanjiCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (user) {
        // User logged in, fetch from Firestore
        const q = query(collection(db, 'users', user.uid, 'kanjiDeck'));
        
        // Listen to changes
        unsubscribeSnapshot = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
          const loadedDeck: KanjiCard[] = [];
          snapshot.forEach((docSnap) => {
            loadedDeck.push(docSnap.data() as KanjiCard);
          });
          setDeck(loadedDeck.sort((a,b) => b.createdAt - a.createdAt));
          setIsLoaded(true);
          
          if (snapshot.metadata.hasPendingWrites) {
            console.log("Local changes haven't synced to server yet.");
          } else {
            console.log("Synced to server.");
          }
        }, (error) => {
          console.error("Firestore error in onSnapshot:", error);
          setIsLoaded(true); // Don't block UI if error
        });
      } else {
        // Not logged in, load from localStorage if possible (fallback)
        const stored = localStorage.getItem('kanji_srs_deck');
        if (stored) {
          try {
            setDeck(JSON.parse(stored));
          } catch (e) {}
        } else {
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
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Sync to localStorage as a backup when not authenticated
  useEffect(() => {
    if (isLoaded && !auth.currentUser) {
      localStorage.setItem('kanji_srs_deck', JSON.stringify(deck));
    }
  }, [deck, isLoaded]);

  const addCard = async (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, example?: string, exampleTranslation?: string, wordType?: string) => {
    const newCard: KanjiCard = {
      id: crypto.randomUUID(),
      kanji,
      reading,
      sinoVietnamese,
      meaning,
      example,
      exampleTranslation,
      wordType,
      freeStudyScore: 0,
      difficultScore: 0,
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
    
    // Decrease difficult score if forgotten in normal review, making it more prioritized for difficult review
    if (grade === 'forgot') {
      updatedCard.difficultScore = (updatedCard.difficultScore || 0) - 1;
    } else if (grade === 'good' || grade === 'easy') {
      // Nhớ trong ôn tập bình thường cũng giúp phục hồi điểm hay quên
      updatedCard.difficultScore = Math.min(0, Math.floor((updatedCard.difficultScore || 0) / 2) + 1);
    }

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
    const nowThreshold = getEndOfTodayTimestamp();
    return deck.filter(card => card.nextReviewDate <= nowThreshold);
  };

  const importCards = async (importedCards: { kanji: string; reading: string; meaning: string; sinoVietnamese?: string; example?: string; exampleTranslation?: string; wordType?: string }[]) => {
    const existingKanjiMap = new Map<string, KanjiCard>(deck.map(c => [c.kanji, c]));
    
    // De-duplicate within the imported cards themselves (keep last one in the file if kanji match)
    const uniqueImported = new Map<string, { kanji: string; reading: string; meaning: string; sinoVietnamese?: string; example?: string; exampleTranslation?: string; wordType?: string }>();
    for (const c of importedCards) {
        if (c.kanji) {
            uniqueImported.set(c.kanji, c);
        }
    }
    
    const cardsToAdd: KanjiCard[] = [];
    const cardsToUpdate: KanjiCard[] = [];

    for (const imported of uniqueImported.values()) {
        const existing = existingKanjiMap.get(imported.kanji);
        if (existing) {
             const hasChanges = (imported.reading && existing.reading !== imported.reading) ||
                                (imported.sinoVietnamese && existing.sinoVietnamese !== imported.sinoVietnamese) ||
                                (imported.example && existing.example !== imported.example) ||
                                (imported.exampleTranslation && existing.exampleTranslation !== imported.exampleTranslation) ||
                                (imported.wordType && existing.wordType !== imported.wordType) ||
                                (imported.meaning && existing.meaning !== imported.meaning);
             
             if (hasChanges) {
                 cardsToUpdate.push({
                     ...existing,
                     reading: imported.reading || existing.reading,
                     sinoVietnamese: imported.sinoVietnamese || existing.sinoVietnamese,
                     meaning: imported.meaning || existing.meaning,
                     example: imported.example || existing.example,
                     exampleTranslation: imported.exampleTranslation || existing.exampleTranslation,
                     wordType: imported.wordType || existing.wordType
                 });
             }
        } else {
            cardsToAdd.push({
               id: crypto.randomUUID(),
               kanji: imported.kanji,
               reading: imported.reading || '',
               sinoVietnamese: imported.sinoVietnamese || '',
               meaning: imported.meaning || '',
               example: imported.example || '',
               exampleTranslation: imported.exampleTranslation || '',
               wordType: imported.wordType || '',
               freeStudyScore: 0,
               difficultScore: 0,
               interval: 0,
               repetition: 0,
               easeFactor: 2.5,
               nextReviewDate: Date.now(),
               createdAt: Date.now()
            });
        }
    }

    if (cardsToAdd.length === 0 && cardsToUpdate.length === 0) return { added: 0, updated: 0 };

    if (auth.currentUser) {
        try {
            const allOps = [...cardsToAdd, ...cardsToUpdate];
            for (let i = 0; i < allOps.length; i += 400) {
                const batch = writeBatch(db);
                const chunk = allOps.slice(i, i + 400);
                for (const card of chunk) {
                    const cardRef = doc(db, 'users', auth.currentUser!.uid, 'kanjiDeck', card.id);
                    batch.set(cardRef, card, { merge: true });
                }
                await batch.commit();
            }
        } catch (err) {
             console.error("Error batch importing cards:", err);
             throw err;
        }
    } else {
        setDeck(prev => {
            const newDeck = [...prev];
            // Process updates
            cardsToUpdate.forEach(updatedCard => {
                 const idx = newDeck.findIndex(c => c.id === updatedCard.id);
                 if (idx !== -1) newDeck[idx] = updatedCard;
            });
            // Process adds
            return [...cardsToAdd, ...newDeck];
        });
    }
    
    return { added: cardsToAdd.length, updated: cardsToUpdate.length };
  };

  const updateCard = async (id: string, updates: Partial<Pick<KanjiCard, 'kanji' | 'reading' | 'meaning' | 'sinoVietnamese' | 'example' | 'exampleTranslation' | 'wordType' | 'freeStudyScore' | 'difficultScore'>>) => {
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id), updates, { merge: true });
      } catch (err) {
        console.error("Error updating card:", err);
      }
    } else {
      setDeck(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
    }
  };

  return { deck, addCard, removeCard, updateCard, reviewCard, getDueCards, importCards, isLoaded };
}
