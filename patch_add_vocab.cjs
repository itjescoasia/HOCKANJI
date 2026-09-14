const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

const t1 = `  const [isSaving, setIsSaving] = useState(false);`;
const r1 = `  const [isSaving, setIsSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleGenerateSingle = async (text: string | undefined, onComplete: (url: string) => void, id: string) => {
    if (!text) return;
    setGeneratingId(id);
    try {
      const { generateAndUploadTTS } = await import('../utils/playTTS');
      const url = await generateAndUploadTTS(text);
      if (url) {
        onComplete(url);
      } else {
        alert("Có lỗi khi tạo âm thanh. Vui lòng kiểm tra API Key.");
      }
    } catch(err) {
      alert("Lỗi khi gọi AI tạo âm thanh");
    }
    setGeneratingId(null);
  };`;

code = code.replace(t1, r1);

// main word audio
const t2 = `          <AudioUpload 
            audioUrl={formData.audioUrl} 
            onAudioChange={(url) => setFormData({...formData, audioUrl: url})} 
          />`;

const r2 = `          <AudioUpload 
            audioUrl={formData.audioUrl} 
            onAudioChange={(url) => setFormData({...formData, audioUrl: url})}
            onGenerateAI={formData.kanji && !formData.audioUrl ? () => {
                handleGenerateSingle(formData.kanji, (url) => {
                    setFormData({...formData, audioUrl: url});
                }, 'main-word');
            } : undefined}
            isGenerating={generatingId === 'main-word'}
          />`;
code = code.replace(t2, r2);

// examples audio
const t3 = `                      <AudioUpload 
                        audioUrl={ex.audioUrl} 
                        onAudioChange={(url) => updateExample(index, 'audioUrl', url)} 
                      />`;

const r3 = `                      <AudioUpload 
                        audioUrl={ex.audioUrl} 
                        onAudioChange={(url) => updateExample(index, 'audioUrl', url)} 
                        onGenerateAI={ex.sentence && !ex.audioUrl ? () => {
                            handleGenerateSingle(ex.sentence, (url) => {
                                updateExample(index, 'audioUrl', url);
                                updateExample(index, 'hasAudio', true);
                            }, \`ex-\${index}\`);
                        } : undefined}
                        isGenerating={generatingId === \`ex-\${index}\`}
                      />`;
code = code.replace(t3, r3);

fs.writeFileSync('src/components/AddVocab.tsx', code);
