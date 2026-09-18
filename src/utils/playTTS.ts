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
 * When the app is deployed on an external domain like Cloudflare Workers (kanjipro.it-740.workers.dev),
 * relative /api calls hit Cloudflare instead of the Node.js backend.
 * This resolves to the dedicated backend host when not running on localhost or Cloud Run directly.
 */
export const getApiEndpoint = (endpoint: string): string => {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('workers.dev') || (!host.includes('run.app') && host !== 'localhost' && host !== '127.0.0.1')) {
      const metaEnv = (import.meta as any).env;
      const backendBase = (metaEnv?.VITE_BACKEND_URL as string) || 'https://ais-pre-plx6rkv6vdw73yirw4ujmz-410594632954.asia-east1.run.app';
      return `${backendBase.replace(/\/$/, '')}${cleanPath}`;
    }
  }
  return cleanPath;
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

  // 2. Call backend Inworld AI TTS API
  try {
    const apiUrl = getApiEndpoint('/api/tts');
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });

    if (!res.ok) {
      console.error('[TTS] Inworld TTS generation error status:', res.status);
      return null;
    }

    const data = await res.json();
    if (data.audioContent) {
      // Cache base64 locally for instant offline playback
      await ttsCache.setItem(cleanText, data.audioContent);

      // Upload to Firebase Cloud (Storage or Firestore)
      const cloudUrl = await uploadAudioToCloud(data.audioContent, cleanText);

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
 * Strictly uses Inworld AI audio. NO Google SpeechSynthesis fallback.
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
        if (e.name !== 'AbortError') console.error('[TTS] Playback error:', e);
      });
      return;
    }
  } catch (cacheErr) {
    console.warn('[TTS] Cache read error:', cacheErr);
  }

  // 2. Call Inworld AI backend
  try {
    const apiUrl = getApiEndpoint('/api/tts');
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });

    if (!res.ok) {
      console.warn('[TTS] Inworld TTS API unavailable:', res.status);
      return;
    }

    const data = await res.json();
    if (data.audioContent) {
      // Save to local cache
      await ttsCache.setItem(cleanText, data.audioContent);

      // Play immediately
      if (currentActiveAudio) {
        currentActiveAudio.pause();
        currentActiveAudio.currentTime = 0;
      }
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      currentActiveAudio = audio;
      audio.play().catch(e => {
        if (e.name !== 'AbortError') console.error('[TTS] Playback error:', e);
      });

      // Upload to Cloud in background
      uploadAudioToCloud(data.audioContent, cleanText).then(cloudUrl => {
        if (cloudUrl) {
          window.dispatchEvent(new CustomEvent('tts-generated', {
            detail: { text: cleanText, audioUrl: cloudUrl }
          }));
        }
      }).catch(err => console.warn('[TTS] Background cloud upload error:', err));
    }
  } catch (error) {
    console.error('[TTS] Error playing Inworld TTS:', error);
  }
};

/**
 * Play audio from a URL (Firebase Storage, Firestore, base64 data, or server audio)
 * Strictly does NOT use Google SpeechSynthesis.
 */
export const playAudioUrl = async (url: string, fallbackText?: string | null) => {
  if (!url) {
    if (fallbackText) {
      // Generate or play Inworld AI voice for this text
      playTTS(fallbackText);
    }
    return;
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
          if (fallbackText) playTTS(fallbackText);
          return;
        }
      }
    } catch (err) {
      console.error('[TTS] Error fetching audio from firestore:', err);
      if (fallbackText) playTTS(fallbackText);
      return;
    }
  } else if (url.startsWith('/api/audio/') || url.startsWith('/')) {
    // If running on external host (e.g., Cloudflare Workers kanjipro.it-740.workers.dev)
    // First, check if fallbackText is in local cache
    if (fallbackText) {
      const cached = await ttsCache.getItem<string>(fallbackText.trim());
      if (cached) {
        finalUrl = cached.startsWith('data:') ? cached : `data:audio/mp3;base64,${cached}`;
      }
    }

    // Check if the URL is relative and we are on an external host
    if (finalUrl.startsWith('/')) {
      finalUrl = getApiEndpoint(finalUrl);
    }
  }

  try {
    const audio = new Audio(finalUrl);
    currentActiveAudio = audio;

    audio.onerror = () => {
      console.warn('[TTS] Audio failed to load from URL:', finalUrl);
      if (fallbackText) {
        // Retry with Inworld AI TTS generation (NEVER Google voice)
        playTTS(fallbackText);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        if (e.name !== 'AbortError') {
          console.warn('[TTS] Audio playback error:', e);
          if (fallbackText) {
            playTTS(fallbackText);
          }
        }
      });
    }
  } catch (err) {
    console.error('[TTS] Audio initialization error:', err);
    if (fallbackText) {
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
 * Deprecated dummy export to avoid breaking any legacy imports.
 * Strictly does nothing - Web Speech / Google TTS is permanently disabled.
 */
export const fallbackTTS = (_text: string) => {
  // Google TTS is disabled as requested by user.
};
