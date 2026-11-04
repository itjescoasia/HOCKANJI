import { getLocalDateString } from '../lib/dateUtils';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

/**
 * Records an audio listening event whenever the user clicks a speaker icon
 * on a vocabulary word or example sentence that has an MP3 audio file.
 */
export function recordAudioListen(): number {
  const today = getLocalDateString();
  let newCount = 1;

  try {
    // 1. Update localStorage kanji_srs_stats
    const rawStats = localStorage.getItem('kanji_srs_stats');
    let parsedStats: Record<string, any> = {};
    if (rawStats) {
      try {
        parsedStats = JSON.parse(rawStats);
      } catch (e) {
        parsedStats = {};
      }
    }

    if (!parsedStats[today]) {
      parsedStats[today] = {
        reviewed: 0,
        correct: 0,
        mastered: 0,
        newLearned: 0,
        freeStudyTime: 0,
        audioListens: 0,
      };
    }

    const currentListens = Number(parsedStats[today].audioListens) || 0;
    newCount = currentListens + 1;
    parsedStats[today].audioListens = newCount;
    localStorage.setItem('kanji_srs_stats', JSON.stringify(parsedStats));

    // Also update a standalone daily counter for quick lookups
    localStorage.setItem(`daily_audio_listens_${today}`, String(newCount));
  } catch (err) {
    console.warn('[ActivityTracker] LocalStorage update warning:', err);
  }

  // 2. Sync atomically to Firestore if user is authenticated
  try {
    if (auth.currentUser) {
      const statsRef = doc(db, 'users', auth.currentUser.uid, 'userStats', 'daily');
      setDoc(
        statsRef,
        {
          [today]: {
            audioListens: increment(1),
          },
        },
        { merge: true }
      ).catch((err) => {
        console.warn('[ActivityTracker] Firestore audioListens sync warning:', err);
      });
    }
  } catch (err) {
    console.warn('[ActivityTracker] Firestore error:', err);
  }

  // 3. Dispatch global browser event so all UI components update in real time
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app-audio-listen-recorded', {
          detail: {
            date: today,
            count: newCount,
          },
        })
      );
    }
  } catch (e) {}

  return newCount;
}

/**
 * Gets total audio listen count recorded for a given date (defaults to today)
 */
export function getAudioListensForDate(dateStr?: string): number {
  const targetDate = dateStr || getLocalDateString();
  try {
    // Check direct key
    const directVal = localStorage.getItem(`daily_audio_listens_${targetDate}`);
    if (directVal !== null) {
      return Number(directVal) || 0;
    }

    const rawStats = localStorage.getItem('kanji_srs_stats');
    if (rawStats) {
      const parsed = JSON.parse(rawStats);
      if (parsed[targetDate] && parsed[targetDate].audioListens !== undefined) {
        return Number(parsed[targetDate].audioListens) || 0;
      }
    }
  } catch (e) {}
  return 0;
}
