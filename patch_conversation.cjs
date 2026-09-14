const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// Add import
const importMatch = `import { Conversation, DialogueSentence, playAudio } from '../types';`;
if (!code.includes('generateAndUploadTTS')) {
  code = code.replace(importMatch, importMatch + `\nimport { playTTS, generateAndUploadTTS } from '../utils/playTTS';\nimport { Music } from 'lucide-react';`);
}

const t1 = `function SentenceAudio({ conversationId, dialogue, onUpdateDialogue }: { conversationId: string, dialogue: DialogueSentence, onUpdateDialogue: (id: string, updates: Partial<DialogueSentence>) => void }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);`;

const r1 = `function SentenceAudio({ conversationId, dialogue, onUpdateDialogue }: { conversationId: string, dialogue: DialogueSentence, onUpdateDialogue: (id: string, updates: Partial<DialogueSentence>) => void }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToRead = dialogue.japanese || dialogue.hiragana;
    if (!textToRead) return;
    setIsGenerating(true);
    try {
      const url = await generateAndUploadTTS(textToRead);
      if (url) {
        onUpdateDialogue(dialogue.id, { hasAudio: true, audioUrl: url });
        setAudioUrl(url);
        const audio = new Audio(url);
        audio.play().catch(console.error);
      } else {
        alert("Có lỗi khi tạo âm thanh.");
      }
    } catch(err) {
      alert("Lỗi khi gọi AI tạo âm thanh");
    } finally {
      setIsGenerating(false);
    }
  };`;

const t2 = `      {!audioUrl ? (
        <button 
          onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }} 
          className="flex items-center gap-1.5 px-2 py-1 bg-theme-primary/10 text-theme-primary/70 rounded text-[10px] hover:bg-theme-accent hover:text-theme-inverted transition-colors"
        >
          <Volume2 className="w-3 h-3" />
          {isUploading ? 'Đang tải...' : 'Thêm MP3'}
        </button>
      ) : (`;

const r2 = `      {!audioUrl ? (
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }} 
            className="flex items-center gap-1.5 px-2 py-1 bg-theme-primary/10 text-theme-primary/70 rounded text-[10px] hover:bg-theme-accent hover:text-theme-inverted transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            {isUploading ? 'Đang tải...' : 'Thêm MP3'}
          </button>
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-2 py-1 bg-theme-accent/10 text-theme-accent rounded text-[10px] hover:bg-theme-accent hover:text-theme-inverted transition-colors disabled:opacity-50"
          >
            <Music className="w-3 h-3" />
            {isGenerating ? 'Đang tạo...' : 'Tải âm thanh (AI)'}
          </button>
        </div>
      ) : (`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);
fs.writeFileSync('src/components/ConversationView.tsx', code);
