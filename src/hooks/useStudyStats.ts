import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getLocalDateString } from '../lib/dateUtils';

export interface DailyStats {
  reviewed: number;
  correct: number;
  mastered: number;
  newLearned: number;
  freeStudyTime?: number;
  wotdId?: string;
}

export interface UserStats {
  [dateString: string]: DailyStats;
}

export function useStudyStats() {
  const [stats, setStats] = useState<UserStats>({});
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);
  
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
          setIsStatsLoaded(true);
        }, (error) => {
          console.error('Firestore useStudyStats error:', error);
          setIsStatsLoaded(true);
        });
      } else {
        const localStats = localStorage.getItem('kanji_srs_stats');
        setStats(localStats ? JSON.parse(localStats) : {});
        setIsStatsLoaded(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const recordReview = async (isCorrect: boolean, isNewlyMastered: boolean, isNewCard?: boolean, isWellRemembered?: boolean) => {
    const today = getLocalDateString();
    
    setStats(prevStats => {
      const todayStats = prevStats[today] || { reviewed: 0, correct: 0, mastered: 0, newLearned: 0, remembered: 0, freeStudyTime: 0 };
      
      const newStats = {
        ...prevStats,
        [today]: {
          ...todayStats,
          reviewed: todayStats.reviewed + 1,
          correct: todayStats.correct + (isCorrect ? 1 : 0),
          mastered: todayStats.mastered + (isNewlyMastered ? 1 : 0),
          newLearned: (todayStats.newLearned || 0) + (isNewCard ? 1 : 0),
          remembered: (todayStats.remembered || 0) + (isWellRemembered ? 1 : 0),
        }
      };
      
      if (auth.currentUser) {
        const statsRef = doc(db, 'users', auth.currentUser.uid, 'userStats', 'daily');
        setDoc(statsRef, newStats, { merge: true }).catch(err => console.error('Error saving stats:', err));
      } else {
        localStorage.setItem('kanji_srs_stats', JSON.stringify(newStats));
      }
      
      return newStats;
    });
  };

  const recordFreeStudyTime = async (seconds: number) => {
    if (seconds <= 0) return;
    const today = getLocalDateString();
    
    setStats(prevStats => {
      const todayStats = prevStats[today] || { reviewed: 0, correct: 0, mastered: 0, newLearned: 0, freeStudyTime: 0 };
      
      const newStats = {
        ...prevStats,
        [today]: {
          ...todayStats,
          freeStudyTime: (todayStats.freeStudyTime || 0) + seconds,
        }
      };
      
      if (auth.currentUser) {
        const statsRef = doc(db, 'users', auth.currentUser.uid, 'userStats', 'daily');
        setDoc(statsRef, newStats, { merge: true }).catch(err => console.error('Error saving stats:', err));
      } else {
        localStorage.setItem('kanji_srs_stats', JSON.stringify(newStats));
      }
      
      return newStats;
    });
  };

  const recordWordOfTheDay = async (wotdId: string) => {
    const today = getLocalDateString();
    
    setStats(prevStats => {
      const todayStats = prevStats[today] || { reviewed: 0, correct: 0, mastered: 0, newLearned: 0, freeStudyTime: 0, remembered: 0 };
      
      // Check if it's already recorded to prevent infinite loops / multiple writes
      if (todayStats.wotdId === wotdId) return prevStats;

      const newStats = {
        ...prevStats,
        [today]: {
          ...todayStats,
          wotdId,
        }
      };
      
      if (auth.currentUser) {
        const statsRef = doc(db, 'users', auth.currentUser.uid, 'userStats', 'daily');
        setDoc(statsRef, newStats, { merge: true }).catch(err => {
          console.error('Error saving stats:', err);
        });
      } else {
        localStorage.setItem('kanji_srs_stats', JSON.stringify(newStats));
      }
      
      return newStats;
    });
  };

  return { stats, isStatsLoaded, recordReview, recordFreeStudyTime, recordWordOfTheDay };
}
