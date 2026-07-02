import { useState, useEffect } from 'react';
import { Conversation, DialogueSentence } from '../types';
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

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (user) {
        const basePath = `users/${user.uid}/conversations`;
        const q = query(collection(db, 'users', user.uid, 'conversations'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const loadedConversations: Conversation[] = [];
          snapshot.forEach((docSnap) => {
            loadedConversations.push(docSnap.data() as Conversation);
          });
          setConversations(loadedConversations.sort((a,b) => b.createdAt - a.createdAt));
          setIsLoaded(true);
        }, (error) => {
          setIsLoaded(true);
          handleFirestoreError(error, OperationType.GET, basePath);
        });
      } else {
        const stored = localStorage.getItem('conversations_v1');
        if (stored) {
          try {
            setConversations(JSON.parse(stored));
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
      localStorage.setItem('conversations_v1', JSON.stringify(conversations));
    }
  }, [conversations, isLoaded]);

  const addConversation = async (conversation: Conversation) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/conversations/${conversation.id}`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', conversation.id), conversation);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      setConversations(prev => [conversation, ...prev]);
    }
  };

  const removeConversation = async (id: string) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/conversations/${id}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/conversations/${id}`;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', id), updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setConversations(prev => prev.map(conv => conv.id === id ? { ...conv, ...updates } : conv));
    }
  };

  return { conversations, addConversation, removeConversation, updateConversation, isLoaded };
}
