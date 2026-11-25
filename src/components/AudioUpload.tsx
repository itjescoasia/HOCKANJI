import { playAudioUrl, getApiEndpoint } from '../utils/playTTS';
import { safeFetchJson } from '../utils/safeFetch';
import { notify } from '../utils/feedback';
import React, { useRef, useState } from 'react';
import { Upload, X, Music, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage, auth } from '../lib/firebase';

interface AudioUploadProps {
  audioUrl?: string | null;
  onAudioChange: (url: string | null) => void;
  className?: string;
}

export default function AudioUpload({ audioUrl, onAudioChange, className = '' }: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      notify.warning('Vui lòng chọn file âm thanh (mp3, m4a, v.v.)');
      return;
    }

    try {
      setIsUploading(true);
      
      // Attempt Firebase Storage first
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Chưa đăng nhập");

        const filename = `users/${uid}/audio/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filename);
        
        // Thêm timeout 5 giây để tránh treo Firebase
        await Promise.race([
          uploadBytes(storageRef, file),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout khi upload Cloud")), 5000))
        ]);
        
        const url = await getDownloadURL(storageRef);
        onAudioChange(url);
      } catch (err) {
        console.warn("Firebase Storage failed, falling back to server disk and Firestore", err);
        try {
          const base64Str = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          // Upload to server disk (/api/upload-audio)
          try {
            const res = await fetch(getApiEndpoint('/api/upload-audio'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64Data: base64Str, filename: file.name })
            });
            const parsed = await safeFetchJson(res);
            if (parsed.ok && parsed.data?.audioUrl) {
              onAudioChange(parsed.data.audioUrl);
              return;
            }
          } catch (serverErr) {
            console.warn("Server upload-audio failed, trying Firestore:", serverErr);
          }

          // Fallback to Firestore
          const uid = auth.currentUser?.uid;
          if (uid) {
            const audioId = Date.now() + "_" + Math.random().toString(36).substring(7);
            const audioDocRef = doc(db, 'global_audio', audioId);
            await setDoc(audioDocRef, { data: base64Str, createdAt: Date.now() });
            onAudioChange('firestore:' + audioId);
          } else {
            onAudioChange(base64Str);
          }
        } catch (e) {
          console.error("Firestore/local fallback save failed:", e);
          notify.error("Lỗi khi lưu audio. Vui lòng thử lại.");
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`min-h-[38px] flex flex-wrap items-center gap-2 ${className}`}>
      {audioUrl ? (
        <div className="flex items-center gap-2 bg-theme-base-alt border border-theme-subtle rounded-lg px-2.5 py-1.5 min-h-[36px] text-xs text-theme-primary">
          <Music className="w-3.5 h-3.5 text-theme-accent shrink-0" />
          <span className="truncate max-w-[130px] opacity-85 font-medium">Đã có âm thanh</span>
          <button
            type="button"
            onClick={(e) => { 
               e.stopPropagation();
               playAudioUrl(audioUrl);
            }}
            className="text-theme-accent opacity-85 hover:opacity-100 px-1.5 py-0.5 rounded hover:bg-theme-accent/10 cursor-pointer shrink-0"
            title="Nghe thử"
          >
            ▶
          </button>
          <button 
            type="button" 
            onClick={() => onAudioChange(null)}
            className="text-theme-primary/50 hover:text-red-500 p-1 rounded cursor-pointer shrink-0"
            title="Xóa âm thanh"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={`inline-flex items-center justify-center gap-1.5 bg-theme-base-alt border border-theme-subtle rounded-lg px-3 py-1.5 min-h-[36px] text-xs text-theme-primary/85 hover:text-theme-primary hover:border-theme-accent/60 transition-colors shrink-0 whitespace-nowrap ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <Upload className="w-3.5 h-3.5 shrink-0" />}
          <span>{isUploading ? 'Đang tải...' : 'File MP3'}</span>
          <input 
            type="file" 
            accept="audio/*" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
