import React, { useRef, useState } from 'react';
import { Upload, X, Music } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase'; // or whatever the path is

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
      const filename = `audio/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onAudioChange(url);
    } catch (err) {
      console.error("Upload error", err);
      alert('Lỗi tải file âm thanh lên.');
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
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary opacity-70 hover:opacity-100 disabled:opacity-50"
        >
          <Upload className="w-3 h-3" />
          {isUploading ? 'Đang tải...' : 'Thêm MP3'}
        </button>
      )}
      <input 
        type="file" 
        accept="audio/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
}
