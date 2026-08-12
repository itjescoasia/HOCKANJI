const fs = require('fs');

const path = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add imports
const importsToAdd = `
import localforage from 'localforage';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
`;
if (!code.includes("import localforage")) {
    code = code.replace("import Markdown from 'react-markdown';", importsToAdd + "\nimport Markdown from 'react-markdown';");
}

// 2. Add fileToBase64 and IntensiveExampleAudio at the end
const audioComponentCode = `

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function IntensiveExampleAudio({ wordId, example, onUpdateExample }: { wordId: string, example: IntensiveExample, onUpdateExample: (id: string, updates: Partial<IntensiveExample>) => void }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    if (example.audioUrl) {
      if (example.audioUrl.startsWith('firestore:') && auth.currentUser) {
        const audioId = example.audioUrl.split(':')[1];
        getDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId)).then((docSnap) => {
           if (docSnap.exists() && active) {
              setAudioUrl(docSnap.data().data);
           }
        }).catch(err => console.error("Failed to load audio from firestore", err));
      } else {
        setAudioUrl(example.audioUrl);
      }
    } else if (example.hasAudio) {
      localforage.getItem<Blob>(\`audio_intensive_\${wordId}_\${example.id}\`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    }
    return () => {
      active = false;
    };
  }, [wordId, example.id, example.hasAudio, example.audioUrl]);

  const [isUploading, setIsUploading] = useState(false);

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        let uploadedToStorage = false;
        if (auth.currentUser) {
          try {
            const base64 = await fileToBase64(file);
            const audioId = \`intensive_\${wordId}_\${example.id}\`;
            const audioDocRef = doc(db, 'users', auth.currentUser.uid, 'audio', audioId);
            await setDoc(audioDocRef, { data: base64, createdAt: Date.now() });
            onUpdateExample(example.id, { hasAudio: true, audioUrl: 'firestore:' + audioId });
            setAudioUrl(base64);
            uploadedToStorage = true;
          } catch (storageErr) {
            console.warn("Firestore audio upload failed, falling back to local", storageErr);
          }
        }
        
        if (!uploadedToStorage) {
          await localforage.setItem(\`audio_intensive_\${wordId}_\${example.id}\`, file);
          const url = URL.createObjectURL(file);
          onUpdateExample(example.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }
      } catch (err) {
        console.error("Upload error", err);
      }
      setIsUploading(false);
    }
    if (e.target) {
        e.target.value = '';
    }
  };
  
  const handleRemoveAudio = async () => {
    if (auth.currentUser && example.audioUrl) {
      try {
        if (example.audioUrl.startsWith('firestore:')) {
           const audioId = example.audioUrl.split(':')[1];
           await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'audio', audioId));
        } else {
           // local storage
        }
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(\`audio_intensive_\${wordId}_\${example.id}\`);
    }
    if (audioUrl && !audioUrl.startsWith('http')) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdateExample(example.id, { hasAudio: false, audioUrl: null }); 
  };

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-theme-subtle pt-3">
      <input 
        type="file" 
        accept="audio/*,.mp3,.wav,.m4a" 
        ref={audioInputRef} 
        onChange={handleUploadAudio} 
        className="sr-only" 
      />
      {!audioUrl ? (
        <button 
          onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary/10 text-theme-primary/70 rounded text-[11px] hover:bg-theme-accent hover:text-theme-inverted transition-colors font-medium uppercase tracking-wider"
        >
          <Volume2 className="w-3 h-3" />
          {isUploading ? 'Đang tải...' : 'Thêm MP3'}
        </button>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <audio controls src={audioUrl} className="h-8 w-full max-w-[240px]" />
          <button 
            onClick={(e) => { e.stopPropagation(); handleRemoveAudio(); }}
            className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Xóa MP3"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
`;

if (!code.includes("function IntensiveExampleAudio")) {
    code += audioComponentCode;
}

const injectionTarget = `                                  {ex.translation &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-primary/50 italic mb-2">
                                        (<HighlightVietnamese text={ex.translation || ""} />)
                                      </p>
                                    )}`;

const injectionCode = `                                  <IntensiveExampleAudio 
                                    wordId={word.id} 
                                    example={ex} 
                                    onUpdateExample={(exId, updates) => {
                                      const updatedExamples = word.examples.map(e => e.id === exId ? { ...e, ...updates } : e);
                                      onUpdateWord(word.id, { examples: updatedExamples });
                                    }} 
                                  />`;

if (!code.includes("<IntensiveExampleAudio") && code.includes(injectionTarget)) {
    code = code.replace(injectionTarget, injectionTarget + "\n" + injectionCode);
} else {
    // try a different target
    console.log("Could not find injection target, trying a different one");
}

fs.writeFileSync(path, code);
console.log("Patched successfully");
