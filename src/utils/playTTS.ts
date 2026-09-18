import localforage from 'localforage';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth, db } from '../lib/firebase';
import { doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';

const ttsCache = localforage.createInstance({
  name: 'tts-cache',
  storeName: 'audio_cache'
});

let currentActiveAudio: HTMLAudioElement | null = null;

export const playTTS = async (text: string) => {
  if (!text) return;
  try {
    // 1. Check local cache first for instant playback
    const cachedAudio = await ttsCache.getItem<string>(text);
    if (cachedAudio) {
      console.log("Playing from TTS Cache:", text);
      if (currentActiveAudio) {
        currentActiveAudio.pause();
        currentActiveAudio.currentTime = 0;
      }
      const audio = new Audio(`data:audio/mp3;base64,${cachedAudio}`);
      currentActiveAudio = audio;
      audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Audio playback error:", e);
        }
      });
      
      // If we are playing from cache, maybe it wasn't saved to cloud yet?
      // But let's assume it is, or it will be. We'll dispatch the base64 URL anyway
      // just in case the DB needs it, though it might hit the 1MB limit.
      // Better to only dispatch the event when we generate and upload it.
      return;
    }

    // 2. Generate new audio via API
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!res.ok) {
      const err = await res.text();
      console.error("API error", res.status, err);
      console.warn("Inworld TTS failed or missing, falling back to window.speechSynthesis");
      fallbackTTS(text);
      return null;
    }
    if (res.ok) {
      const data = await res.json();
      if (data.audioContent) {
        // Save to local cache for instant future plays on this device
        await ttsCache.setItem(text, data.audioContent);
        console.log("Saved to TTS Cache:", text);
        
        const base64Url = `data:audio/mp3;base64,${data.audioContent}`;
        if (currentActiveAudio) {
          currentActiveAudio.pause();
          currentActiveAudio.currentTime = 0;
        }
        const audio = new Audio(base64Url);
        currentActiveAudio = audio;
        audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Audio playback error:", e);
        }
      });
        
        // 3. Dispatch event with direct server audioUrl so card can update in background
        if (data.audioUrl) {
          window.dispatchEvent(new CustomEvent('tts-generated', { 
            detail: { text, audioUrl: data.audioUrl } 
          }));
        }
        
        return; // Success
      }
    } else {
       console.error("TTS API returned", res.status);
    }
    
    // Fallback if API fails or isn't configured
    console.warn("Inworld TTS failed or missing, falling back to window.speechSynthesis");
    fallbackTTS(text);
  } catch (error) {
    console.error("Error playing TTS:", error);
    fallbackTTS(text);
  }
};

export const fallbackTTS = (text: string) => {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.88;

    const pickVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja'));
      if (jpVoice) utterance.voice = jpVoice;
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      pickVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        pickVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          window.speechSynthesis.speak(utterance);
        }
      }, 60);
    }
  } catch (err) {
    console.warn("speechSynthesis error:", err);
  }
};

export const generateAndUploadTTS = async (text: string): Promise<string | null> => {
  if (!text || !text.trim()) return null;
  const cleanText = text.trim();
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.audioContent) {
        // Cache to local indexedDB for zero-latency instant offline playback
        await ttsCache.setItem(cleanText, data.audioContent);
        console.log("Bulk generated & saved to TTS Cache:", cleanText);
      }
      
      // Server returned permanent direct audio URL
      if (data.audioUrl) {
        return data.audioUrl;
      }
      
      if (data.audioContent) {
        return `data:audio/mp3;base64,${data.audioContent}`;
      }
    } else {
      console.error("TTS API error status:", res.status);
    }
  } catch (error) {
    console.error("Error bulk generating TTS:", error);
  }
  return null;
};

export const playAudioUrl = async (url: string, fallbackText?: string | null) => {
  if (!url) {
    if (fallbackText) fallbackTTS(fallbackText);
    return;
  }
  
  if (currentActiveAudio) {
    try {
      currentActiveAudio.pause();
      currentActiveAudio.currentTime = 0;
    } catch (e) {}
  }

  let hasFallbackTriggered = false;
  const triggerFallback = () => {
    if (!hasFallbackTriggered && fallbackText) {
      hasFallbackTriggered = true;
      console.warn("Audio file failed or missing on this host, playing via Web Speech TTS:", fallbackText);
      fallbackTTS(fallbackText);
    }
  };
  
  let finalUrl = url;
  if (url.startsWith('firestore:') && auth.currentUser) {
     try {
       const audioId = url.split(':')[1];
       const docSnap = await getDoc(doc(db, 'global_audio', audioId));
       if (docSnap.exists()) {
          finalUrl = docSnap.data().data;
       } else {
          console.warn("Firestore audio not found");
          triggerFallback();
          return;
       }
     } catch(err) {
       console.error("Error fetching audio from firestore", err);
       triggerFallback();
       return;
     }
  }

  try {
    const audio = new Audio(finalUrl);
    currentActiveAudio = audio;

    audio.onerror = () => {
      triggerFallback();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        if (e.name !== 'AbortError') {
          console.warn("Audio playback error, falling back to Web Speech:", e);
          triggerFallback();
        }
      });
    }
  } catch (err) {
    console.error("Audio initialization error:", err);
    triggerFallback();
  }
};

export const deleteCloudAudio = async (url?: string | null) => {
  if (!url || typeof url !== 'string') return;
  
  try {
    if (url.startsWith('firestore:') && auth.currentUser) {
       const audioId = url.split(':')[1];
       await deleteDoc(doc(db, 'global_audio', audioId));
       console.log("Deleted old audio from firestore:", url);
       return;
    }
    
    if (url.includes('firebasestorage.googleapis.com')) {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      console.log("Deleted old audio from cloud storage:", url);
    }
  } catch (err) {
    console.warn("Failed to delete cloud audio:", err);
  }
};
