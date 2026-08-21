const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

const targetStr = `      ) : (
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
      />`;

const replacementStr = `      ) : (
        <label
          className={\`flex items-center gap-1 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary opacity-70 hover:opacity-100 \${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}
        >
          <Upload className="w-3 h-3" />
          {isUploading ? 'Đang tải...' : 'Thêm MP3'}
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isUploading}
          />
        </label>
      )}
`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AudioUpload.tsx', code);
