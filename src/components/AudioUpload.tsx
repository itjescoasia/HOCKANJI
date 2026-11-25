import { playAudioUrl, getApiEndpoint } from '../utils/playTTS';
import { safeFetchJson } from '../utils/safeFetch';
import { notify } from '../utils/feedback';
import React, { useRef, useState } from 'react';
import { Upload, X, Music, Link as LinkIcon, Check, Loader2, Sparkles } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { storage, auth } from '../lib/firebase';

interface AudioUploadProps {
  audioUrl?: string | null;
  onAudioChange: (url: string | null) => void;
  className?: string;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export default function AudioUpload({ audioUrl, onAudioChange, className = '', onGenerateAI, isGenerating }: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onAudioChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
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
      ) : showUrlInput ? (
        <div className="flex items-center gap-1.5 w-full">
          <div className="relative flex-1 min-w-0">
            <input 
              type="text" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowUrlInput(false);
                }
              }}
              placeholder="Dán link mp3..." 
              className="w-full bg-theme-base border border-theme-subtle rounded-lg px-2.5 py-1.5 min-h-[36px] text-xs text-theme-primary outline-none focus:border-theme-accent"
              autoFocus
            />
          </div>
          <button 
            type="button"
            onClick={handleUrlSubmit}
            className="min-h-[36px] px-2.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
            title="Xác nhận"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="min-h-[36px] px-2.5 rounded-lg bg-theme-base-alt text-theme-primary/60 hover:text-red-500 border border-theme-subtle transition-colors cursor-pointer shrink-0"
            title="Hủy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          <label
            className={`inline-flex items-center justify-center gap-1.5 bg-theme-base-alt border border-theme-subtle rounded-lg px-2.5 py-1.5 min-h-[36px] text-xs text-theme-primary/85 hover:text-theme-primary hover:border-theme-accent/60 transition-colors shrink-0 whitespace-nowrap ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-theme-base-alt border border-theme-subtle rounded-lg px-2.5 py-1.5 min-h-[36px] text-xs text-theme-primary/85 hover:text-theme-primary hover:border-theme-accent/60 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Link web</span>
          </button>
          
          {onGenerateAI && (
            <button
              type="button"
              onClick={onGenerateAI}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-1.5 bg-theme-accent/10 border border-theme-accent/25 rounded-lg px-3 py-1.5 min-h-[36px] min-w-[148px] text-xs font-medium text-theme-accent hover:bg-theme-accent/20 disabled:opacity-60 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <Sparkles className="w-3.5 h-3.5 shrink-0" />}
              <span>{isGenerating ? 'Đang tạo AI...' : 'Tải âm thanh (AI)'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
