import localforage from 'localforage';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth, db } from '../lib/firebase';
import { doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';

export const ttsCache = localforage.createInstance({
  name: 'tts-cache',
  storeName: 'audio_cache'
});

let currentActiveAudio: HTMLAudioElement | null = null;

/**
 * Resolves the backend API endpoint.
 * When the app is configured with VITE_BACKEND_URL, routes to that backend.
 * Otherwise returns the relative cleanPath.
 */
export const getApiEndpoint = (endpoint: string): string => {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (typeof window !== 'undefined') {
    const metaEnv = (import.meta as any).env;
    const customBackend = metaEnv?.VITE_BACKEND_URL as string;
    if (customBackend) {
      return `${customBackend.replace(/\/$/, '')}${cleanPath}`;
    }
  }
  return cleanPath;
};

/**
 * Native Japanese speech synthesis fallback.
 * Ensures the user always hears clear pronunciation even if external network/APIs fail.
 */
export const speakWithWebSpeech = (text: string): boolean => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja') || v.lang.includes('JP'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('[TTS] Web Speech error:', err);
    return false;
  }
};

/**
 * Convert an ArrayBuffer into a base64 string
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Client-side fallback to fetch Japanese audio via Google TTS
 */
export const fetchGoogleTtsBase64 = async (cleanText: string): Promise<string | null> => {
  try {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(cleanText) + '&tl=ja&client=tw-ob';
    const res = await fetch(url);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 0) {
        return arrayBufferToBase64(buffer);
      }
    }
  } catch (err) {
    console.warn('[TTS] Client Google TTS fetch failed:', err);
  }
  return null;
};

// Client-side quota exhaustion timestamp to avoid repeated 402 error calls to Inworld AI
// Automatically re-tests after 10 minutes to seamlessly resume Inworld TTS when credits are restored
let clientInworldQuotaExhaustedUntil = 0;
const isClientInworldAvailable = () => Date.now() > clientInworldQuotaExhaustedUntil;

/**
 * Calls TTS API to synthesize Japanese speech.
 * Strategy:
 * 1. Calls the server /api/tts endpoint (which supports Inworld AI and automatically falls back to Google TTS).
 * 2. If running on external static hosts or server fails, attempts direct Inworld AI call.
 * 3. If Inworld credits are exhausted, falls back to direct Google TTS.
 */
export const callInworldTtsApi = async (cleanText: string): Promise<string | null> => {
  const isStaticExternalHost = typeof window !== 'undefined' && 
    (window.location.hostname.includes('workers.dev') || 
     window.location.hostname.includes('pages.dev') || 
     window.location.hostname.includes('netlify.app') || 
     window.location.hostname.includes('vercel.app'));

  // 1. Server API route (when fullstack backend is running)
  try {
    const apiUrl = getApiEndpoint('/api/tts');
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioContent) {
        return data.audioContent;
      }
    } else {
      console.warn('[TTS] Backend /api/tts returned non-ok status:', res.status);
    }
  } catch (backendErr) {
    console.warn('[TTS] Backend /api/tts call failed:', backendErr);
  }

  // Get Inworld API key
  const apiKey = (typeof __INWORLD_API_KEY__ !== 'undefined' && __INWORLD_API_KEY__) 
    || ((import.meta as any).env?.VITE_INWORLD_API_KEY as string) 
    || 'WUNNS0pEVWlSTHZkUG9UalFEeG1YRS1xdUU1U0ZGaW06VVEyUlVYejNrQVNpeGJkTHdZblllNw==';

  // 2. Direct Inworld AI call (only if not temporarily out of credits)
  if (apiKey && isClientInworldAvailable()) {
    try {
      const directRes = await fetch('https://api.inworld.ai/tts/v1/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiKey}`
        },
        body: JSON.stringify({
          text: cleanText,
          voiceId: 'Hina',
          modelId: 'inworld-tts-1.5-max',
          audioConfig: { speakingRate: 0.85 },
          temperature: 1
        })
      });

      if (directRes.ok) {
        const data = await directRes.json();
        if (data.audioContent) {
          clientInworldQuotaExhaustedUntil = 0; // recovered
          return data.audioContent;
        }
      } else {
        if (directRes.status === 402 || directRes.status === 429) {
          clientInworldQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
        }
      }
    } catch (directErr) {
      // ignore and fallback to Google TTS
    }
  }

  // 3. Fallback: Google TTS
  const googleAudio = await fetchGoogleTtsBase64(cleanText);
  if (googleAudio) {
    return googleAudio;
  }

  return null;
};

/**
 * Convert base64 audio data into an MP3 Blob for Cloud Storage upload
 */
export const base64ToBlob = (base64Data: string, mimeType = 'audio/mp3'): Blob => {
  const cleanBase64 = base64Data.replace(/^data:audio\/[^;]+;base64,/, '');
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Upload audio file (base64 or Blob) to Firebase Cloud (Storage or Firestore global_audio)
 * Returns a permanent, accessible Cloud URL
 */
export const uploadAudioToCloud = async (base64Data: string, identifier?: string): Promise<string> => {
  const cleanBase64 = base64Data.replace(/^data:audio\/[^;]+;base64,/, '');
  const safeId = (identifier || Date.now().toString()).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

  // Strategy 1: Firebase Storage (preferred for MP3 files)
  try {
    const blob = base64ToBlob(cleanBase64, 'audio/mp3');
    const storagePath = `audio/inworld_${Date.now()}_${safeId}.mp3`;
    const storageRef = ref(storage, storagePath);

    await Promise.race([
      uploadBytes(storageRef, blob, { contentType: 'audio/mp3' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Storage upload timeout')), 10000))
    ]);

    const downloadUrl = await getDownloadURL(storageRef);
    console.log('[TTS] Uploaded to Firebase Storage:', downloadUrl);
    return downloadUrl;
  } catch (storageErr) {
    console.warn('[TTS] Firebase Storage upload failed, falling back to Firestore global_audio:', storageErr);
  }

  // Strategy 2: Firestore global_audio collection (always reliable Cloud document storage)
  try {
    const audioDocId = `tts_${Date.now()}_${safeId}`;
    const audioDocRef = doc(db, 'global_audio', audioDocId);
    await setDoc(audioDocRef, {
      data: `data:audio/mp3;base64,${cleanBase64}`,
      createdAt: Date.now(),
      identifier: safeId
    });
    console.log('[TTS] Saved to Firestore global_audio:', audioDocId);
    return `firestore:${audioDocId}`;
  } catch (firestoreErr) {
    console.error('[TTS] Firestore global_audio upload failed:', firestoreErr);
  }

  // Strategy 3: Inline data URL if cloud upload fails
  return `data:audio/mp3;base64,${cleanBase64}`;
};

/**
 * Generate audio via Inworld AI and permanently upload it to Cloud (Firebase Storage / Firestore)
 */
export const generateAndUploadTTS = async (text: string): Promise<string | null> => {
  if (!text || !text.trim()) return null;
  const cleanText = text.trim();

  // 1. Check local indexedDB cache
  try {
    const cached = await ttsCache.getItem<string>(cleanText);
    if (cached) {
      console.log('[TTS] Found in local cache, uploading to Cloud:', cleanText);
      const cloudUrl = await uploadAudioToCloud(cached, cleanText);
      if (cloudUrl) {
        window.dispatchEvent(new CustomEvent('tts-generated', {
          detail: { text: cleanText, audioUrl: cloudUrl }
        }));
        return cloudUrl;
      }
    }
  } catch (e) {
    console.warn('[TTS] Cache check error:', e);
  }

  // 2. Synthesize using Inworld AI (via direct or backend API)
  try {
    const audioContent = await callInworldTtsApi(cleanText);
    if (audioContent) {
      // Cache base64 locally for instant offline playback
      await ttsCache.setItem(cleanText, audioContent);

      // Upload to Firebase Cloud (Storage or Firestore)
      const cloudUrl = await uploadAudioToCloud(audioContent, cleanText);

      // Notify cards and decks of the permanent Cloud URL
      if (cloudUrl) {
        window.dispatchEvent(new CustomEvent('tts-generated', {
          detail: { text: cleanText, audioUrl: cloudUrl }
        }));
      }

      return cloudUrl;
    }
  } catch (error) {
    console.error('[TTS] Error generating and uploading Inworld TTS:', error);
  }
  return null;
};

/**
 * Play audio from text using Inworld AI voice.
 * Automatically falls back to high-fidelity Web Speech if external services are unreachable.
 */
export const playTTS = async (text: string) => {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  // 1. Check local IndexedDB cache first for instant 0ms playback
  try {
    const cachedAudio = await ttsCache.getItem<string>(cleanText);
    if (cachedAudio) {
      console.log('[TTS] Playing Inworld AI from local cache:', cleanText);
      if (currentActiveAudio) {
        currentActiveAudio.pause();
        currentActiveAudio.currentTime = 0;
      }
      const audio = new Audio(`data:audio/mp3;base64,${cachedAudio}`);
      currentActiveAudio = audio;
      audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.warn('[TTS] Local cache audio play error, falling back to Web Speech:', e);
          speakWithWebSpeech(cleanText);
        }
      });
      return;
    }
  } catch (cacheErr) {
    console.warn('[TTS] Cache read error:', cacheErr);
  }

  // 2. Synthesize using Inworld AI (via direct or backend API)
  try {
    const audioContent = await callInworldTtsApi(cleanText);
    if (audioContent) {
      // Save to local cache
      await ttsCache.setItem(cleanText, audioContent);

      // Play immediately
      if (currentActiveAudio) {
        currentActiveAudio.pause();
        currentActiveAudio.currentTime = 0;
      }
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      currentActiveAudio = audio;
      audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.warn('[TTS] Audio play error, falling back to Web Speech:', e);
          speakWithWebSpeech(cleanText);
        }
      });

      // Upload to Cloud in background so other devices also get it
      uploadAudioToCloud(audioContent, cleanText).then(cloudUrl => {
        if (cloudUrl) {
          window.dispatchEvent(new CustomEvent('tts-generated', {
            detail: { text: cleanText, audioUrl: cloudUrl }
          }));
        }
      }).catch(err => console.warn('[TTS] Background cloud upload error:', err));
      return;
    }
  } catch (error) {
    console.error('[TTS] Error playing Inworld TTS:', error);
  }

  // 3. Fallback to Web Speech API if Inworld AI generation was unavailable
  console.warn('[TTS] Inworld AI voice generation failed, using native Japanese voice fallback');
  speakWithWebSpeech(cleanText);
};

/**
 * Play audio from a URL (Firebase Storage, Firestore, base64 data, or server audio)
 */
export const playAudioUrl = async (url: string, fallbackText?: string | null, allowTTSFallback: boolean = false) => {
  if (!url) {
    if (allowTTSFallback && fallbackText) {
      await playTTS(fallbackText);
    }
    return;
  }

  const isStaticExternalHost = typeof window !== 'undefined' && 
    (window.location.hostname.includes('workers.dev') || 
     window.location.hostname.includes('pages.dev') || 
     window.location.hostname.includes('netlify.app') || 
     window.location.hostname.includes('vercel.app'));

  // On external static hosts (e.g. Cloudflare Workers kanjipro.it-740.workers.dev),
  // local server relative paths (/api/audio/...) do not exist on the static host.
  if (isStaticExternalHost && (url.startsWith('/api/audio/') || (url.startsWith('/') && !url.startsWith('//')))) {
    if (allowTTSFallback && fallbackText) {
      await playTTS(fallbackText);
      return;
    }
  }

  if (currentActiveAudio) {
    try {
      currentActiveAudio.pause();
      currentActiveAudio.currentTime = 0;
    } catch (e) {}
  }

  let finalUrl = url;

  // Handle Firestore Cloud audio
  if (url.startsWith('firestore:')) {
    const audioId = url.replace('firestore:', '');
    try {
      // Check cache first
      const cached = await ttsCache.getItem<string>(audioId);
      if (cached) {
        finalUrl = cached.startsWith('data:') ? cached : `data:audio/mp3;base64,${cached}`;
      } else {
        const docSnap = await getDoc(doc(db, 'global_audio', audioId));
        if (docSnap.exists()) {
          finalUrl = docSnap.data().data;
          // Cache locally
          if (finalUrl) {
            await ttsCache.setItem(audioId, finalUrl);
          }
        } else {
          console.warn('[TTS] Firestore audio not found for ID:', audioId);
          if (allowTTSFallback && fallbackText) await playTTS(fallbackText);
          return;
        }
      }
    } catch (err) {
      console.error('[TTS] Error fetching audio from firestore:', err);
      if (allowTTSFallback && fallbackText) await playTTS(fallbackText);
      return;
    }
  } else if (url.startsWith('/api/audio/') || url.startsWith('/')) {
    // If running with relative path, check local cache first
    if (fallbackText) {
      const cached = await ttsCache.getItem<string>(fallbackText.trim());
      if (cached) {
        finalUrl = cached.startsWith('data:') ? cached : `data:audio/mp3;base64,${cached}`;
      }
    }

    if (finalUrl.startsWith('/')) {
      finalUrl = getApiEndpoint(finalUrl);
    }
  }

  try {
    const audio = new Audio(finalUrl);
    currentActiveAudio = audio;

    audio.onerror = () => {
      console.warn('[TTS] Audio failed to load from URL:', finalUrl);
      if (allowTTSFallback && fallbackText) {
        playTTS(fallbackText);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        if (e.name !== 'AbortError') {
          console.warn('[TTS] Audio playback error:', e);
          if (allowTTSFallback && fallbackText) {
            playTTS(fallbackText);
          }
        }
      });
    }
  } catch (err) {
    console.error('[TTS] Audio initialization error:', err);
    if (allowTTSFallback && fallbackText) {
      playTTS(fallbackText);
    }
  }
};

/**
 * Delete audio from Cloud (Storage or Firestore)
 */
export const deleteCloudAudio = async (url?: string | null) => {
  if (!url || typeof url !== 'string') return;

  try {
    if (url.startsWith('firestore:')) {
      const audioId = url.replace('firestore:', '');
      await deleteDoc(doc(db, 'global_audio', audioId));
      console.log('[TTS] Deleted audio from firestore:', url);
      return;
    }

    if (url.includes('firebasestorage.googleapis.com')) {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      console.log('[TTS] Deleted audio from cloud storage:', url);
    }
  } catch (err) {
    console.warn('[TTS] Failed to delete cloud audio:', err);
  }
};

/**
 * Speech synthesis fallback export
 */
export const fallbackTTS = (text: string) => {
  speakWithWebSpeech(text);
};
