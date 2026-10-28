import localforage from 'localforage';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, getDocFromCache, setDoc } from 'firebase/firestore';
import { KanjiCard, IntensiveExample } from '../types';
import { ttsCache, getApiEndpoint } from './playTTS';

// In-memory cache to prevent multiple round-trips within the same session
const memoryAudioCache = new Map<string, string>();

/**
 * Registry of all known uploaded audio documents in Firestore global_audio.
 * Keyed by example UUID (with or without 'example-' / 'ex-' prefix).
 */
export const KNOWN_CLOUD_AUDIO_MAPPING: Record<string, string> = {
  // Word 眠る / 眠い examples
  'fbf9bf06-d6f0-410a-97b0-0648c09ee3f6': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_fbf9bf06-d6f0-410a-97b0-0648c09ee3f6',
  'example-fbf9bf06-d6f0-410a-97b0-0648c09ee3f6': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_fbf9bf06-d6f0-410a-97b0-0648c09ee3f6',
  'ex-214214': 'firestore:1740924976725_214214',
  '214214': 'firestore:1740924976725_214214',
  'ex-209191': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_ex-209191',
  '209191': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_ex-209191',

  // Other uploaded intensive examples
  '5b48fcce-ddc7-45ca-be7f-480a2e58beb7': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_5b48fcce-ddc7-45ca-be7f-480a2e58beb7',
  '5c71f9dd-69ff-441b-8d97-0a82c441d0a0': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_5c71f9dd-69ff-441b-8d97-0a82c441d0a0',
  '61fc6500-07a4-4d0b-af19-0b8c16e15bca': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_61fc6500-07a4-4d0b-af19-0b8c16e15bca',
  '6324ad66-3a51-464a-9528-382e4168e09f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_6324ad66-3a51-464a-9528-382e4168e09f',
  '63f5d139-681e-4a66-a3f8-930fdb782ebe': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_63f5d139-681e-4a66-a3f8-930fdb782ebe',
  '654c497b-6480-4652-8740-fc055959b460': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_654c497b-6480-4652-8740-fc055959b460',
  '6be127e3-06f1-4133-80f1-dd09f9b8f398': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_6be127e3-06f1-4133-80f1-dd09f9b8f398',
  '7171b39a-bdd3-4dfb-abed-c6c438e57fa7': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_7171b39a-bdd3-4dfb-abed-c6c438e57fa7',
  '720d4187-7fb0-4899-bdf0-8c9eb9355fb5': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_720d4187-7fb0-4899-bdf0-8c9eb9355fb5',
  '7a4f7e27-5068-4c51-a46b-289b27abb126': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_7a4f7e27-5068-4c51-a46b-289b27abb126',
  '840b1607-21e7-4a22-aaa9-51a2641e3d3f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_840b1607-21e7-4a22-aaa9-51a2641e3d3f',
  '887d21a0-7546-4f76-acf5-7d9c438ad262': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_887d21a0-7546-4f76-acf5-7d9c438ad262',
  '8bf4a482-d559-45bc-bd02-5f5dccd2fecd': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_8bf4a482-d559-45bc-bd02-5f5dccd2fecd',
  '8c774b31-706f-4d1f-88de-32d54045ed8f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_8c774b31-706f-4d1f-88de-32d54045ed8f',
  '8d9bc795-7f59-476f-bbcc-c71e75d2be2f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_8d9bc795-7f59-476f-bbcc-c71e75d2be2f',
  '97ce63c6-5a11-4065-9987-7786e39aa356': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_97ce63c6-5a11-4065-9987-7786e39aa356',
  '98421f38-a685-4c6e-a93a-903eda49728d': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_98421f38-a685-4c6e-a93a-903eda49728d',
  '9b75b841-f70e-4468-a176-07cc58ee739c': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_9b75b841-f70e-4468-a176-07cc58ee739c',
  'a0163f2f-73c5-4464-bd3b-b4d63004a66f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_a0163f2f-73c5-4464-bd3b-b4d63004a66f',
  'a6f86c04-fa2f-4023-9278-cae2e15a8222': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_a6f86c04-fa2f-4023-9278-cae2e15a8222',
  'a8007c9f-e9a8-4c20-ae54-cf423e6a8452': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_a8007c9f-e9a8-4c20-ae54-cf423e6a8452',
  'a9a7b3c3-366d-431e-9276-b58d5023c87f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_a9a7b3c3-366d-431e-9276-b58d5023c87f',
  'aefa027a-07d1-4484-a17d-4a45bced8f0b': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_aefa027a-07d1-4484-a17d-4a45bced8f0b',
  'b15fc943-d953-4bee-ab47-1b2f94dd4701': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_b15fc943-d953-4bee-ab47-1b2f94dd4701',
  'b1968644-7a99-40fd-bc62-b622b87194c1': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_b1968644-7a99-40fd-bc62-b622b87194c1',
  'b9ea6852-8916-40a4-aa69-77ea80a0a659': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_b9ea6852-8916-40a4-aa69-77ea80a0a659',
  'bf803173-dee9-4aa8-9ac8-fb47fc1f6e43': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_bf803173-dee9-4aa8-9ac8-fb47fc1f6e43',
  'caf21fcb-843f-43cf-9233-b94ef6ab2f2e': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_caf21fcb-843f-43cf-9233-b94ef6ab2f2e',
  'cb236e72-0a34-496d-89d8-dd74625a9bc8': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_cb236e72-0a34-496d-89d8-dd74625a9bc8',
  'd743ebd2-3682-48a9-a8e5-55e2ed2b871f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_d743ebd2-3682-48a9-a8e5-55e2ed2b871f',
  'd9d0a3a1-21f2-4972-ab86-98fbecabbdf4': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_d9d0a3a1-21f2-4972-ab86-98fbecabbdf4',
  'defe1f25-5b13-4981-901d-c2c1c9b4b7c0': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_defe1f25-5b13-4981-901d-c2c1c9b4b7c0',
  'ef2baf85-b279-48d8-bb42-57eaec1f73d2': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_ef2baf85-b279-48d8-bb42-57eaec1f73d2',
  'f12e9aaf-09b8-4646-9b51-6a10f313ed3f': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_f12e9aaf-09b8-4646-9b51-6a10f313ed3f',
  'fb93c53b-a59e-419c-8a22-f595beba0d62': 'firestore:intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_fb93c53b-a59e-419c-8a22-f595beba0d62',
  'df14ec8c-0c69-491c-ad0e-f7f909a9062e': 'firestore:intensive_bbfaab72-cd38-41ef-a56d-ada081c160ad_df14ec8c-0c69-491c-ad0e-f7f909a9062e',
  '7e023c25-7950-44c0-a02e-bdc83bcdadab': 'firestore:intensive_bc3f20cd-6d2a-4616-b054-26fb3d4c4204_7e023c25-7950-44c0-a02e-bdc83bcdadab',
  '0fc187a7-0ce3-4662-b9db-e5b482b46f48': 'firestore:intensive_f375365f-bb7c-4d9d-8966-e4a3c649387c_0fc187a7-0ce3-4662-b9db-e5b482b46f48',
  '2ef6b8e3-b271-4d79-9c41-570b947091a7': 'firestore:intensive_f375365f-bb7c-4d9d-8966-e4a3c649387c_2ef6b8e3-b271-4d79-9c41-570b947091a7',
  '3bd408aa-f1dd-462c-b489-ea36e1d2c90a': 'firestore:intensive_f375365f-bb7c-4d9d-8966-e4a3c649387c_3bd408aa-f1dd-462c-b489-ea36e1d2c90a',
  '6931288b-97eb-474f-9865-002c05ba3eb7': 'firestore:intensive_f375365f-bb7c-4d9d-8966-e4a3c649387c_6931288b-97eb-474f-9865-002c05ba3eb7',
  '70699947-0837-415d-844a-1a2ed525d191': 'firestore:intensive_f375365f-bb7c-4d9d-8966-e4a3c649387c_70699947-0837-415d-844a-1a2ed525d191',
  '92723edc-2599-441c-be7d-a94f2734a67c': 'firestore:intensive_f375365f-bb7c-4d9d-8966-e4a3c649387c_92723edc-2599-441c-be7d-a94f2734a67c',
};

function normalizeText(str?: string | null): string {
  if (!str) return '';
  return str.replace(/[\s\u3000、。！？,.!?]/g, '').toLowerCase();
}

/**
 * Resolves the audio URL for an IntensiveExample by inspecting:
 * 1. example.audioUrl (if already set)
 * 2. KNOWN_CLOUD_AUDIO_MAPPING (by id or clean UUID)
 * 3. Localforage / IndexedDB audio blob
 * 4. Matching sentence from mainDeck
 */
export async function resolveExampleAudioUrl(
  example: IntensiveExample,
  wordId: string,
  mainDeck?: KanjiCard[]
): Promise<string | null> {
  if (example.audioUrl) {
    return example.audioUrl;
  }

  const rawId = example.id || '';
  const cleanId = rawId.replace(/^example-/, '').replace(/^ex-/, '');

  // 1. Direct match in KNOWN_CLOUD_AUDIO_MAPPING
  if (KNOWN_CLOUD_AUDIO_MAPPING[rawId]) {
    return KNOWN_CLOUD_AUDIO_MAPPING[rawId];
  }
  if (KNOWN_CLOUD_AUDIO_MAPPING[cleanId]) {
    return KNOWN_CLOUD_AUDIO_MAPPING[cleanId];
  }

  // 2. Check localforage keys for this example
  try {
    const keysToCheck = [
      `audio_intensive_${wordId}_${rawId}`,
      `audio_intensive_${wordId}_${cleanId}`,
      `audio_intensive_${rawId}`,
      `audio_intensive_${cleanId}`,
      `audio_intensive_a6aba8e8-074b-4bca-a3c1-ff933ef96109_${cleanId}`,
    ];
    for (const key of keysToCheck) {
      const blob = await localforage.getItem<Blob>(key);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    }
  } catch (err) {
    console.warn('[AudioRegistry] Localforage check failed:', err);
  }

  // 3. Match sentence in mainDeck (Kanji cards)
  if (mainDeck && mainDeck.length > 0 && example.sentence) {
    const targetNorm = normalizeText(example.sentence);
    for (const card of mainDeck) {
      if (card.examples) {
        for (const ex of card.examples) {
          if (ex.audioUrl && normalizeText(ex.sentence) === targetNorm) {
            return ex.audioUrl;
          }
        }
      }
      if (card.example && card.audioUrl && normalizeText(card.example) === targetNorm) {
        return card.audioUrl;
      }
    }
  }

  return null;
}

/**
 * Loads audio content string/data URL safely with multi-layer caching:
 * Memory -> IndexedDB (ttsCache) -> Firestore Cache -> Firestore Network
 */
export async function loadAudioContent(url: string): Promise<string | null> {
  if (!url) return null;

  // Direct data: URL or HTTP URL
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  if (url.startsWith('/api/audio/') || url.startsWith('http')) {
    return url.startsWith('/') ? getApiEndpoint(url) : url;
  }

  if (url.startsWith('firestore:')) {
    const audioId = url.replace('firestore:', '');

    // 1. Memory cache
    if (memoryAudioCache.has(audioId)) {
      return memoryAudioCache.get(audioId)!;
    }

    // 2. Local IndexedDB cache (ttsCache)
    try {
      const cached = await ttsCache.getItem<string>(audioId);
      if (cached) {
        const fullData = cached.startsWith('data:') ? cached : `data:audio/mp3;base64,${cached}`;
        memoryAudioCache.set(audioId, fullData);
        return fullData;
      }
    } catch (e) {
      console.warn('[AudioRegistry] ttsCache read warning:', e);
    }

    // 3. Firestore (try local cache first to avoid quota hits)
    try {
      let docSnap = null;
      try {
        docSnap = await getDocFromCache(doc(db, 'global_audio', audioId));
      } catch (cacheErr) {
        // Not in local cache, proceed to network getDoc
      }

      if (!docSnap || !docSnap.exists()) {
        docSnap = await getDoc(doc(db, 'global_audio', audioId));
      }

      if (docSnap && docSnap.exists()) {
        const docData = docSnap.data();
        const base64Data = docData?.data;
        if (base64Data) {
          const finalData = base64Data.startsWith('data:') ? base64Data : `data:audio/mp3;base64,${base64Data}`;
          memoryAudioCache.set(audioId, finalData);
          try {
            await ttsCache.setItem(audioId, finalData);
          } catch (e) {}
          return finalData;
        }
      }
    } catch (firestoreErr) {
      console.warn('[AudioRegistry] Firestore audio fetch failed (quota or offline):', firestoreErr);
    }
  }

  return null;
}

/**
 * Resilient upload for audio files:
 * 1. Uploads to local server disk via /api/upload-audio (100% reliable, no Firestore quota)
 * 2. Caches in localforage & ttsCache
 * 3. Also writes to Firestore global_audio if authenticated
 */
export async function uploadResilientAudio(
  file: File,
  exampleId: string,
  wordId: string
): Promise<{ audioUrl: string; audioContent: string }> {
  const base64: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const cleanId = exampleId.replace(/^example-/, '').replace(/^ex-/, '');
  const audioId = `intensive_${wordId}_${cleanId}`;

  // Cache immediately in local stores
  try {
    await localforage.setItem(`audio_intensive_${wordId}_${exampleId}`, file);
    await localforage.setItem(`audio_intensive_${wordId}_${cleanId}`, file);
    await ttsCache.setItem(audioId, base64);
    memoryAudioCache.set(audioId, base64);
  } catch (cacheErr) {
    console.warn('[AudioRegistry] Local cache write warning:', cacheErr);
  }

  let serverAudioUrl: string | null = null;

  // 1. Try uploading to local server /api/upload-audio
  try {
    const res = await fetch('/api/upload-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data: base64,
        filename: `${wordId}_${cleanId}`
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audioUrl) {
        serverAudioUrl = data.audioUrl;
      }
    }
  } catch (serverErr) {
    console.warn('[AudioRegistry] Server upload warning:', serverErr);
  }

  // 2. Also save to Firestore global_audio as cloud backup
  if (auth.currentUser) {
    try {
      const audioDocRef = doc(db, 'global_audio', audioId);
      await setDoc(audioDocRef, {
        data: base64,
        createdAt: Date.now(),
        identifier: cleanId,
        wordId
      });
    } catch (firestoreErr) {
      console.warn('[AudioRegistry] Firestore global_audio backup warning:', firestoreErr);
    }
  }

  const finalUrl = serverAudioUrl || `firestore:${audioId}`;
  return { audioUrl: finalUrl, audioContent: base64 };
}
