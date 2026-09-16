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
        
        // 3. Upload to Firebase Storage so it is saved in the cloud
        try {
          const uid = auth.currentUser?.uid;
          if (uid) {
             const resBlob = await fetch(base64Url);
             const blob = await resBlob.blob();
             const filename = `users/${uid}/audio/${Date.now()}_${Math.random().toString(36).substring(7)}_TTS.mp3`;
             const storageRef = ref(storage, filename);
             
             await Promise.race([
                uploadBytes(storageRef, blob),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout khi upload Cloud")), 15000))
             ]);
             
             const downloadUrl = await getDownloadURL(storageRef);
             
             // Dispatch event to update the card in the database
             window.dispatchEvent(new CustomEvent('tts-generated', { 
               detail: { text, audioUrl: downloadUrl } 
             }));
             return;
          }
        } catch (uploadError) {
          console.warn("Failed to upload TTS to cloud storage:", uploadError);
        }
        
        // Bỏ lưu base64 vào DB để tránh lỗi vượt quá 1MB
        
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

const fallbackTTS = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  const voices = window.speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang === 'ja-JP');
  if (jpVoice) utterance.voice = jpVoice;
  window.speechSynthesis.speak(utterance);
}

export const generateAndUploadTTS = async (text: string): Promise<string | null> => {
  if (!text) return null;
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.audioContent) {
        await ttsCache.setItem(text, data.audioContent);
        console.log("Bulk generated & saved to TTS Cache:", text);
        
        const base64Url = `data:audio/mp3;base64,${data.audioContent}`;
        
        try {
          const uid = auth.currentUser?.uid;
          if (uid) {
             const resBlob = await fetch(base64Url);
             const blob = await resBlob.blob();
             const filename = `users/${uid}/audio/${Date.now()}_${Math.random().toString(36).substring(7)}_TTS.mp3`;
             const storageRef = ref(storage, filename);
             
             await Promise.race([
                uploadBytes(storageRef, blob),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout khi upload Cloud")), 15000))
             ]);
             
             const downloadUrl = await getDownloadURL(storageRef);
             
             return downloadUrl;
          }
        } catch (uploadError) {
          console.warn("Bulk upload failed:", uploadError);
          const uid = auth.currentUser?.uid;
          if (uid) {
             try {
                const audioId = Date.now() + "_" + Math.random().toString(36).substring(7);
                const audioDocRef = doc(db, 'users', uid, 'audio', audioId);
                await setDoc(audioDocRef, { data: base64Url, createdAt: Date.now() });
                console.log("Saved audio to firestore fallback collection.");
                return 'firestore:' + audioId;
             } catch (fsErr) {
                console.warn("Firestore fallback failed:", fsErr);
             }
          }
        }
        
        // If all fails, just return null so we don't blow up the document limit
        return null;
      }
    }
  } catch (error) {
    console.error("Error bulk generating TTS:", error);
  }
  return null;
};

export const playAudioUrl = async (url: string) => {
  if (!url) return;
  
  if (currentActiveAudio) {
    currentActiveAudio.pause();
    currentActiveAudio.currentTime = 0;
  }
  
  let finalUrl = url;
  if (url.startsWith('firestore:') && auth.currentUser) {
     try {
       const audioId = url.split(':')[1];
       const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
       if (docSnap.exists()) {
          finalUrl = docSnap.data().data;
       } else {
          console.warn("Firestore audio not found");
          return;
       }
     } catch(err) {
       console.error("Error fetching audio from firestore", err);
       return;
     }
  }

  const audio = new Audio(finalUrl);
  currentActiveAudio = audio;
  audio.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Audio playback error:", e);
        }
      });
};

export const deleteCloudAudio = async (url?: string | null) => {
  if (!url || typeof url !== 'string') return;
  
  try {
    if (url.startsWith('firestore:') && auth.currentUser) {
       const audioId = url.split(':')[1];
       await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
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
