const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

const newComponent = `import React, { useRef, useState } from 'react';
import { Upload, X, Music, Link as LinkIcon, Check } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../lib/firebase';

interface AudioUploadProps {
  audioUrl?: string | null;
  onAudioChange: (url: string | null) => void;
  className?: string;
}

export default function AudioUpload({ audioUrl, onAudioChange, className = '' }: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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

        const filename = \`users/\${uid}/audio/\${Date.now()}_\${file.name}\`;
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
        if (file.size > 300 * 1024) { 
           alert('File mp3 quá lớn (Vượt quá 300KB). Do tính năng Cloud Storage chưa được cấp quyền, hệ thống chỉ lưu tạm vào Database nên dung lượng bị giới hạn để không gây sập ứng dụng. Vui lòng cắt mp3 ngắn hơn (khoảng 3-5 giây) hoặc dùng file chất lượng thấp.');
           return;
        }

        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => { 
             onAudioChange(reader.result as string); 
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

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onAudioChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  return (
    <div className={\`flex items-center gap-2 \${className}\`}>
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
               audio.play().catch(() => alert("Không thể phát link âm thanh này. Link có thể bị hỏng hoặc bị chặn CORS."));
            }}
            className="text-theme-accent opacity-80 hover:opacity-100 ml-1"
            title="Nghe thử"
          >
            ▶
          </button>
        </div>
      ) : showUrlInput ? (
        <div className="flex items-center gap-1 w-full relative">
          <input 
            type="text" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="Dán link mp3..." 
            className="w-full bg-theme-base border border-theme-subtle px-2 py-1 text-xs text-theme-primary outline-none focus:border-theme-accent pr-6"
            autoFocus
          />
          <button 
            type="button"
            onClick={handleUrlSubmit}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-400"
            title="Xác nhận"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="absolute -right-5 top-1/2 -translate-y-1/2 text-theme-primary/50 hover:text-red-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <label
            className={\`flex items-center gap-1 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary opacity-70 hover:opacity-100 \${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}
          >
            <Upload className="w-3 h-3" />
            {isUploading ? 'Đang tải...' : 'File MP3'}
            <input 
              type="file" 
              accept="audio/*" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              className="hidden" 
              disabled={isUploading}
            />
          </label>
          <span className="text-theme-primary/30 text-xs">hoặc</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-1 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary opacity-70 hover:opacity-100"
          >
            <LinkIcon className="w-3 h-3" />
            Link web
          </button>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/AudioUpload.tsx', newComponent);
