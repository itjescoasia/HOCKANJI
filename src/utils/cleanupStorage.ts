import localforage from 'localforage';

export const deckStorage = localforage.createInstance({
  name: 'kanji-app-storage',
  storeName: 'decks'
});

/**
 * Migrates large data sets out of browser localStorage into IndexedDB (localforage)
 * and purges bloated keys to eliminate QuotaExceededError.
 */
export async function cleanupAndMigrateStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    // 1. Remove firestore client state locks that may have caused quota exhaustion
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('firestore_clients_') || key.startsWith('firestore_client_'))) {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      }
    }

    // 2. Migrate kanji_srs_deck (can be 4-5MB) to IndexedDB
    const kanjiDeck = localStorage.getItem('kanji_srs_deck');
    if (kanjiDeck) {
      try {
        const parsed = JSON.parse(kanjiDeck);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await deckStorage.setItem('kanji_srs_deck', parsed);
        }
      } catch (e) {}
      try {
        localStorage.removeItem('kanji_srs_deck');
      } catch (e) {}
    }

    // 3. Migrate intensive_vocab_deck_v1 to IndexedDB
    const intensiveDeck = localStorage.getItem('intensive_vocab_deck_v1');
    if (intensiveDeck) {
      try {
        const parsed = JSON.parse(intensiveDeck);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await deckStorage.setItem('intensive_vocab_deck_v1', parsed);
        }
      } catch (e) {}
      try {
        localStorage.removeItem('intensive_vocab_deck_v1');
      } catch (e) {}
    }

    // 4. Migrate conversations_v1 to IndexedDB
    const convos = localStorage.getItem('conversations_v1');
    if (convos) {
      try {
        const parsed = JSON.parse(convos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await deckStorage.setItem('conversations_v1', parsed);
        }
      } catch (e) {}
      try {
        localStorage.removeItem('conversations_v1');
      } catch (e) {}
    }
  } catch (err) {
    console.warn('[StorageCleanup] Error during storage cleanup:', err);
  }
}

// Immediate execution on module load
cleanupAndMigrateStorage();
