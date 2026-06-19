import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface DailyStats {
  reviewed: number;
  correct: number;
  mastered: number;
}

export interface UserStats {
  [dateString: string]: DailyStats;
}

export function useStudyStats() {
  const [stats, setStats] = useState<UserStats>({});
  
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
      
      if (user) {
        const statsRef = doc(db, 'users', user.uid, 'userStats', 'daily');
        unsubscribe = onSnapshot(statsRef, (docSnap) => {
          if (docSnap.exists()) {
            setStats(docSnap.data() as UserStats);
          } else {
            setStats({});
          }
        });
      } else {
        const localStats = localStorage.getItem('kanji_srs_stats');
        setStats(localStats ? JSON.parse(localStats) : {});
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const recordReview = async (isCorrect: boolean, isNewlyMastered: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Optimistic local update
    const prevStats = { ...stats };
    const todayStats = prevStats[today] || { reviewed: 0, correct: 0, mastered: 0 };
    
    const newStats = {
      ...prevStats,
      [today]: {
        reviewed: todayStats.reviewed + 1,
        correct: todayStats.correct + (isCorrect ? 1 : 0),
        mastered: todayStats.mastered + (isNewlyMastered ? 1 : 0),
      }
    };
    
    setStats(newStats);

    if (auth.currentUser) {
      try {
        const statsRef = doc(db, 'users', auth.currentUser.uid, 'userStats', 'daily');
        await setDoc(statsRef, newStats, { merge: true });
      } catch (err) {
        console.error('Error saving stats:', err);
      }
    } else {
      localStorage.setItem('kanji_srs_stats', JSON.stringify(newStats));
    }
  };

  return { stats, recordReview };
}
