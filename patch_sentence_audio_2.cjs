const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// replace SentenceAudio with the correct update function
content = content.replace(
  /function SentenceAudio[\s\S]*?}\n\n?$/,
  `
function SentenceAudio({ conversationId, dialogue, onUpdateDialogue }: { conversationId: string, dialogue: DialogueSentence, onUpdateDialogue: (id: string, updates: Partial<DialogueSentence>) => void }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialogue.hasAudio) {
      localforage.getItem<Blob>(\`audio_\${conversationId}_\${dialogue.id}\`).then((blob) => {
        if (blob) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [conversationId, dialogue.id, dialogue.hasAudio]);

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      await localforage.setItem(\`audio_\${conversationId}_\${dialogue.id}\`, file);
      setAudioUrl(URL.createObjectURL(file));
      onUpdateDialogue(dialogue.id, { hasAudio: true });
    }
    if (e.target) {
        e.target.value = '';
    }
  };
  
  const handleRemoveAudio = async () => {
    await localforage.removeItem(\`audio_\${conversationId}_\${dialogue.id}\`);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdateDialogue(dialogue.id, { hasAudio: false }); 
  };

  return (
    <div className="mt-2 flex items-center gap-2">
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
          className="flex items-center gap-1.5 px-2 py-1 bg-theme-primary/10 text-theme-primary/70 rounded text-[10px] hover:bg-theme-accent hover:text-theme-inverted transition-colors"
        >
          <Volume2 className="w-3 h-3" />
          Thêm MP3
        </button>
      ) : (
        <div className="flex items-center gap-2 w-full max-w-sm">
          <audio controls src={audioUrl} className="h-8 flex-1" />
          <button 
            onClick={(e) => { e.stopPropagation(); handleRemoveAudio(); }}
            className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Xóa MP3"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
`
);

// Add onUpdateDialogue handler inside ConversationView
const handleUpdateDialogueRegex = /const handleUpdateDialogue = \(e: React\.FormEvent\) => {/;
const handleUpdateDialogueContent = `
  const handleUpdateDialogueField = (id: string, updates: Partial<DialogueSentence>) => {
    onUpdate(conversation.id, {
      dialogues: conversation.dialogues.map(d => d.id === id ? { ...d, ...updates } : d)
    });
  };

  const handleUpdateDialogue = (e: React.FormEvent) => {`;
content = content.replace(handleUpdateDialogueRegex, handleUpdateDialogueContent);


// Insert <SentenceAudio /> inside the render loop
const renderVietnamese = `                                  {dialogue.vietnamese && (
                                    <p className="text-sm text-theme-primary/70 mt-1 italic border-l-2 border-theme-primary/20 pl-2">
                                      <HighlightVietnamese text={dialogue.vietnamese || ""} />
                                    </p>
                                  )}`;
const renderVietnameseWithAudio = `                                  {dialogue.vietnamese && (
                                    <p className="text-sm text-theme-primary/70 mt-1 italic border-l-2 border-theme-primary/20 pl-2">
                                      <HighlightVietnamese text={dialogue.vietnamese || ""} />
                                    </p>
                                  )}
                                  <SentenceAudio conversationId={conversation.id} dialogue={dialogue} onUpdateDialogue={handleUpdateDialogueField} />`;

if (content.includes(renderVietnamese)) {
  content = content.replace(renderVietnamese, renderVietnameseWithAudio);
  console.log("Injected SentenceAudio inside map!");
} else {
  console.log("Could not find renderVietnamese to inject SentenceAudio.");
}

fs.writeFileSync('src/components/ConversationView.tsx', content);
