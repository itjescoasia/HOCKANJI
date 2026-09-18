import { useState, useEffect } from 'react';
import { Conversation, DialogueSentence } from '../types';
import { db, auth, removeUndefined } from '../lib/firebase';
import { deleteCloudAudio } from '../utils/playTTS';
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
        const q = query(collection(db, 'global_conversations'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const loadedConversations: Conversation[] = [];
          snapshot.forEach((docSnap) => {
            loadedConversations.push({ id: docSnap.id, ...docSnap.data() } as Conversation);
          });
          setConversations(loadedConversations.sort((a,b) => (b.order ?? b.createdAt) - (a.order ?? a.createdAt)));
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
        await setDoc(doc(db, 'global_conversations', conversation.id), removeUndefined(conversation));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      setConversations(prev => [conversation, ...prev]);
    }
  };

  const removeConversation = async (id: string) => {
    const convoToDelete = conversations.find(c => c.id === id);
    if (convoToDelete) {
      if (convoToDelete.audioUrl) await deleteCloudAudio(convoToDelete.audioUrl);
      if (convoToDelete.dialogues && Array.isArray(convoToDelete.dialogues)) {
        for (const dia of convoToDelete.dialogues) {
          if (dia.audioUrl) await deleteCloudAudio(dia.audioUrl);
        }
      }
    }

    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/conversations/${id}`;
      try {
        await deleteDoc(doc(db, 'global_conversations', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (!id) return;
    
    const oldConv = conversations.find(c => c.id === id);
    if (oldConv) {
       if (updates.audioUrl === null || (updates.audioUrl !== undefined && updates.audioUrl !== oldConv.audioUrl)) {
          if (oldConv.audioUrl) await deleteCloudAudio(oldConv.audioUrl);
       }
       if (updates.dialogues) {
          const newAudioUrls = new Set(updates.dialogues.map(d => d.audioUrl).filter(Boolean));
          for (const dia of oldConv.dialogues || []) {
             if (dia.audioUrl && !newAudioUrls.has(dia.audioUrl)) {
                 await deleteCloudAudio(dia.audioUrl);
             }
          }
       }
    }
    
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/conversations/${id}`;
      try {
        await setDoc(doc(db, 'global_conversations', id), removeUndefined(updates), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setConversations(prev => prev.map(conv => conv.id === id ? { ...conv, ...updates } : conv));
    }
  };

  
  useEffect(() => {
    const handleTTSGenerated = async (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string, audioUrl: string }>;
      const { text, audioUrl } = customEvent.detail;
      
      if (!conversations || conversations.length === 0) return;
      
      for (const conv of conversations) {
         let needsUpdate = false;
         let updates: Partial<Conversation> = {};
         
         if (conv.dialogues) {
            let dialoguesUpdated = false;
            const newDialogues = conv.dialogues.map(d => {
               if (d.japanese === text && d.audioUrl !== audioUrl) {
                  dialoguesUpdated = true;
                  return { ...d, audioUrl, hasAudio: true };
               }
               return d;
            });
            if (dialoguesUpdated) {
               updates.dialogues = newDialogues;
               needsUpdate = true;
            }
         }
         
         if (needsUpdate) {
            console.log("Auto-syncing TTS audio to DB for conversation:", conv.title);
            await updateConversation(conv.id, updates);
         }
      }
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, [conversations, updateConversation]);

  return { conversations, addConversation, removeConversation, updateConversation, isLoaded };
}
