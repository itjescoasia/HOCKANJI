const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const t1 = `    <div className="mt-2" onClick={e => e.stopPropagation()}>
      <input 
        type="file" 
        accept="audio/*" 
        ref={audioInputRef} 
        onChange={handleUploadAudio} 
        className="hidden" 
      />
      {!audioUrl ? (
        <button 
          onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary/10 text-theme-primary/70 rounded text-[11px] hover:bg-theme-accent hover:text-theme-inverted transition-colors font-medium uppercase tracking-wider"
        >
          <Volume2 className="w-3 h-3" />
          {isUploading ? 'Đang tải...' : 'Thêm MP3'}
        </button>
      ) : (`;

const r1 = `    <div className="mt-2" onClick={e => e.stopPropagation()}>
      <input 
        type="file" 
        accept="audio/*" 
        ref={audioInputRef} 
        onChange={handleUploadAudio} 
        className="hidden" 
      />
      {!audioUrl ? (
        <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary/10 text-theme-primary/70 rounded text-[11px] hover:bg-theme-accent hover:text-theme-inverted transition-colors font-medium uppercase tracking-wider"
            >
              <Volume2 className="w-3 h-3" />
              {isUploading ? 'Đang tải...' : 'Thêm MP3'}
            </button>
            <button
                type="button"
                disabled={isUploading}
                onClick={async (e) => {
                    e.stopPropagation();
                    setIsUploading(true);
                    try {
                        const { generateAndUploadTTS } = await import('../utils/playTTS');
                        const url = await generateAndUploadTTS(example.sentence);
                        if (url) {
                            onUpdateExample(example.id, { audioUrl: url, hasAudio: true });
                            setAudioUrl(url);
                        } else {
                            alert("Có lỗi khi tạo âm thanh. Vui lòng kiểm tra API Key.");
                        }
                    } catch(err) {
                        alert("Lỗi khi gọi AI tạo âm thanh");
                    }
                    setIsUploading(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 border border-theme-accent/20 text-[11px] text-theme-accent opacity-90 hover:opacity-100 hover:bg-theme-accent/20 disabled:opacity-50 font-medium uppercase tracking-wider rounded"
              >
                <Music className="w-3 h-3" />
                {isUploading ? 'Đang tạo...' : 'Tải MP3 (AI)'}
              </button>
        </div>
      ) : (`;
code = code.replace(t1, r1);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
