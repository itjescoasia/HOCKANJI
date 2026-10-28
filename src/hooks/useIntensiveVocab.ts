import { useState, useEffect } from 'react';
import { IntensiveWord } from '../types';
import { db, auth, removeUndefined } from '../lib/firebase';
import { deleteCloudAudio } from '../utils/playTTS';
import { deckStorage } from '../utils/cleanupStorage';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useIntensiveVocab() {
  const [intensiveDeck, setIntensiveDeck] = useState<IntensiveWord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fast offline load from IndexedDB
  useEffect(() => {
    deckStorage.getItem<IntensiveWord[]>('intensive_vocab_deck_v1').then((cached) => {
      if (cached && Array.isArray(cached) && cached.length > 0) {
        setIntensiveDeck(prev => prev.length === 0 ? cached : prev);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'global_intensiveVocab'));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const loadedDeck: IntensiveWord[] = [];
      snapshot.forEach((docSnap) => {
        loadedDeck.push({ id: docSnap.id, ...docSnap.data() } as IntensiveWord);
      });
      const sorted = loadedDeck.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      setIntensiveDeck(sorted);
      setIsLoaded(true);
      deckStorage.setItem('intensive_vocab_deck_v1', sorted).catch(() => {});
    }, (error) => {
      setIsLoaded(true);
      console.warn("Firestore error in onSnapshot global_intensiveVocab:", error);
    });

    return () => {
      unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    if (intensiveDeck.length > 0) {
      deckStorage.setItem('intensive_vocab_deck_v1', intensiveDeck).catch(() => {});
    }
  }, [intensiveDeck]);

  const addWord = async (word: IntensiveWord) => {
    setIntensiveDeck(prev => {
      const updated = [word, ...prev];
      deckStorage.setItem('intensive_vocab_deck_v1', updated).catch(() => {});
      return updated;
    });

    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/intensiveVocab/${word.id}`;
      try {
        await setDoc(doc(db, 'global_intensiveVocab', word.id), removeUndefined(word));
      } catch (err) {
        console.warn("Firestore addWord error:", err);
      }
    }
  };

  const removeWord = async (id: string) => {
    const wordToDelete = intensiveDeck.find(w => w.id === id);
    if (wordToDelete) {
      if (wordToDelete.audioUrl) await deleteCloudAudio(wordToDelete.audioUrl);
      if (wordToDelete.examples && Array.isArray(wordToDelete.examples)) {
        for (const ex of wordToDelete.examples) {
          if (ex.audioUrl) await deleteCloudAudio(ex.audioUrl);
        }
      }
    }

    // Optimistic UI update
    setIntensiveDeck(prev => {
      const updated = prev.filter(c => c.id !== id);
      deckStorage.setItem('intensive_vocab_deck_v1', updated).catch(() => {});
      return updated;
    });
    
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/intensiveVocab/${id}`;
      try {
        await deleteDoc(doc(db, 'global_intensiveVocab', id));
      } catch (err) {
        console.warn("Firestore removeWord error:", err);
      }
    }
  };

  const updateWord = async (id: string, updates: Partial<IntensiveWord>) => {
    if (!id) return;
    
    const oldWord = intensiveDeck.find(w => w.id === id);
    let finalUpdates = { ...updates };

    // Protect existing example audio URLs if not provided in updates
    if (oldWord && updates.examples && oldWord.examples) {
      const oldAudioMap = new Map(oldWord.examples.map(ex => [ex.id, { audioUrl: ex.audioUrl, hasAudio: ex.hasAudio }]));
      finalUpdates.examples = updates.examples.map(ex => {
        const oldAudio = oldAudioMap.get(ex.id);
        return {
          ...ex,
          audioUrl: ex.audioUrl !== undefined ? ex.audioUrl : (oldAudio?.audioUrl || null),
          hasAudio: ex.hasAudio !== undefined ? ex.hasAudio : (oldAudio?.hasAudio || false)
        };
      });
    }

    // Optimistic UI update
    setIntensiveDeck(prev => {
      const updated = prev.map(word => word.id === id ? { ...word, ...finalUpdates } : word);
      deckStorage.setItem('intensive_vocab_deck_v1', updated).catch(() => {});
      return updated;
    });

    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/intensiveVocab/${id}`;
      try {
        await setDoc(doc(db, 'global_intensiveVocab', id), removeUndefined(finalUpdates), { merge: true });
      } catch (err) {
        console.warn("Firestore updateWord error:", err);
      }
    }
  };

  const reorderWords = async (reorderedWords: IntensiveWord[]) => {
    if (auth.currentUser) {
      try {
        const batch = writeBatch(db);
        reorderedWords.forEach((word) => {
          const ref = doc(db, 'global_intensiveVocab', word.id);
          batch.set(ref, { order: word.order }, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/intensiveVocab (batch)`);
      }
    } else {
      setIntensiveDeck(reorderedWords);
    }
  };

  useEffect(() => {
    const handleTTSGenerated = async (e: any) => {
      const { text, audioUrl } = e.detail;
      if (!text || !audioUrl) return;

      for (const word of intensiveDeck) {
        let needsUpdate = false;
        let examplesUpdated = false;
        const newExamples = word.examples.map(ex => {
          if (ex.sentence === text && ex.audioUrl !== audioUrl) {
            examplesUpdated = true;
            return { ...ex, audioUrl, hasAudio: true };
          }
          return ex;
        });

        if (examplesUpdated) {
          console.log("Auto-syncing TTS audio to DB for intensive word:", word.word);
          await updateWord(word.id, { examples: newExamples });
        }
      }
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, [intensiveDeck, updateWord]);

  return { intensiveDeck, addWord, removeWord, updateWord, reorderWords, isLoaded };
}
