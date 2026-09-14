const fs = require('fs');
let code = fs.readFileSync('src/components/AudioUpload.tsx', 'utf8');

const t1 = `interface AudioUploadProps {
  audioUrl?: string | null;
  onAudioChange: (url: string | null) => void;
  className?: string;
}`;

const r1 = `interface AudioUploadProps {
  audioUrl?: string | null;
  onAudioChange: (url: string | null) => void;
  className?: string;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}`;
code = code.replace(t1, r1);

const t2 = `export default function AudioUpload({ audioUrl, onAudioChange, className = '' }: AudioUploadProps) {`;
const r2 = `export default function AudioUpload({ audioUrl, onAudioChange, className = '', onGenerateAI, isGenerating }: AudioUploadProps) {`;
code = code.replace(t2, r2);

const t3 = `          <span className="text-theme-primary/30 text-xs">hoặc</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-1 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary opacity-70 hover:opacity-100"
          >
            <LinkIcon className="w-3 h-3" />
            Link web
          </button>
        </div>`;
        
const r3 = `          <span className="text-theme-primary/30 text-xs">hoặc</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-1 bg-theme-base-alt border border-theme-subtle px-2 py-1 text-xs text-theme-primary opacity-70 hover:opacity-100"
          >
            <LinkIcon className="w-3 h-3" />
            Link web
          </button>
          
          {onGenerateAI && (
            <>
              <span className="text-theme-primary/30 text-xs">hoặc</span>
              <button
                type="button"
                onClick={onGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-1 bg-theme-accent/10 border border-theme-accent/20 px-2 py-1 text-xs text-theme-accent opacity-90 hover:opacity-100 hover:bg-theme-accent/20 disabled:opacity-50"
              >
                <Music className="w-3 h-3" />
                {isGenerating ? 'Đang tạo...' : 'Tải âm thanh (AI)'}
              </button>
            </>
          )}
        </div>`;

code = code.replace(t3, r3);

fs.writeFileSync('src/components/AudioUpload.tsx', code);
