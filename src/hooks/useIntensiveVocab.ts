import { useState, useEffect } from 'react';
import { IntensiveWord } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

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

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (user) {
        const basePath = `users/${user.uid}/intensiveVocab`;
        const q = query(collection(db, 'users', user.uid, 'intensiveVocab'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const loadedDeck: IntensiveWord[] = [];
          snapshot.forEach((docSnap) => {
            loadedDeck.push(docSnap.data() as IntensiveWord);
          });
          setIntensiveDeck(loadedDeck.sort((a,b) => b.createdAt - a.createdAt));
          setIsLoaded(true);
        }, (error) => {
          setIsLoaded(true);
          handleFirestoreError(error, OperationType.GET, basePath);
        });
      } else {
        const stored = localStorage.getItem('intensive_vocab_deck_v1');
        if (stored) {
          try {
            setIntensiveDeck(JSON.parse(stored));
          } catch (e) {}
        }
        setIsLoaded(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    if (isLoaded && !auth.currentUser) {
      localStorage.setItem('intensive_vocab_deck_v1', JSON.stringify(intensiveDeck));
    }
  }, [intensiveDeck, isLoaded]);

  const addWord = async (word: IntensiveWord) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/intensiveVocab/${word.id}`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', word.id), word);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      setIntensiveDeck(prev => [word, ...prev]);
    }
  };

  const removeWord = async (id: string) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/intensiveVocab/${id}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setIntensiveDeck(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateWord = async (id: string, updates: Partial<IntensiveWord>) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/intensiveVocab/${id}`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'intensiveVocab', id), updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setIntensiveDeck(prev => prev.map(word => word.id === id ? { ...word, ...updates } : word));
    }
  };

  return { intensiveDeck, addWord, removeWord, updateWord, isLoaded };
}
