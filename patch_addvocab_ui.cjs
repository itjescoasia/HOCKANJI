const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

const target = `        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Ý nghĩa (Tiếng Việt) <span className="text-[#8b0000]">*</span></label>
          <input 
            type="text" 
            required
            value={meaning}
            onChange={e => setMeaning(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-serif uppercase tracking-widest text-center"
            placeholder="NGÔN NGỮ"
          />
        </div>`;

const replacement = `        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Ý nghĩa (Tiếng Việt) <span className="text-[#8b0000]">*</span></label>
          <input 
            type="text" 
            required
            value={meaning}
            onChange={e => setMeaning(e.target.value)}
            className="w-full px-5 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary font-serif uppercase tracking-widest text-center"
            placeholder="NGÔN NGỮ"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-2">Âm thanh phát âm</label>
          <AudioUpload 
            audioUrl={audioUrl} 
            onAudioChange={setAudioUrl} 
          />
        </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AddVocab.tsx', code);
