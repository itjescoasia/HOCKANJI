import React, { useRef, useState } from 'react';
import { Upload, X, Music } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../lib/firebase'; // or whatever the path is

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
      alert('Vui lòng chọn file âm thanh (mp3, m4a, v.v.)');
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
        console.warn("Firebase Storage failed, falling back to Base64", err);
        // Fallback to Base64 data URL if storage is not provisioned or blocked
        if (file.size > 700 * 1024) {
           alert('Tải lên Cloud bị lỗi và file quá lớn (giới hạn 700KB cho chế độ dự phòng). Vui lòng chọn file ngắn hơn.');
           return;
        }
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
             onAudioChange(reader.result);
             resolve(null);
          };
          reader.onerror = () => {
             alert('Lỗi đọc file âm thanh nội bộ.');
             reject(new Error("Lỗi đọc file"));
          };
          reader.readAsDataURL(file);
        });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {audioUrl ? (
        <div className="flex items-center gap-2 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary">
          <Music className="w-3 h-3 text-theme-accent" />
          <span className="truncate max-w-[100px] opacity-70">Đã có âm thanh</span>
          <button 
            type="button" 
            onClick={() => onAudioChange(null)}
            className="text-theme-primary opacity-50 hover:opacity-100"
            title="Xóa âm thanh"
          >
            <X className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
               e.stopPropagation();
               const audio = new Audio(audioUrl);
               audio.play();
            }}
            className="text-theme-accent opacity-80 hover:opacity-100 ml-1"
            title="Nghe thử"
          >
             ▶
          </button>
        </div>
      ) : (
        <label
          className={`flex items-center gap-1 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary opacity-70 hover:opacity-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Upload className="w-3 h-3" />
          {isUploading ? 'Đang tải...' : 'Thêm MP3'}
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
