const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

// Update onAdd signature
code = code.replace(
  'onAdd: (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, examples?: KanjiExample[], wordType?: string, kanjiExplanation?: string, romaji?: string, forms?: { id: string, name: string, value: string, reading?: string, romaji?: string }[]) => void;',
  'onAdd: (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, examples?: KanjiExample[], wordType?: string, kanjiExplanation?: string, romaji?: string, forms?: any[], audioUrl?: string | null, hasAudio?: boolean) => void;'
);

// Add audioUrl state
code = code.replace(
  "const [meaning, setMeaning] = useState('');",
  "const [meaning, setMeaning] = useState('');\n  const [audioUrl, setAudioUrl] = useState<string | null>(null);"
);

// Update onAdd call in handleAdd
code = code.replace(
  `onAdd(
      kanji.trim(), reading.trim(), meaning.trim(), sinoVietnamese.trim(), 
      validExamples.length > 0 ? validExamples : undefined, 
      wordType, kanjiExplanation.trim(), romaji.trim(), 
      validForms.length > 0 ? validForms : undefined
    );`,
  `onAdd(
      kanji.trim(), reading.trim(), meaning.trim(), sinoVietnamese.trim(), 
      validExamples.length > 0 ? validExamples : undefined, 
      wordType, kanjiExplanation.trim(), romaji.trim(), 
      validForms.length > 0 ? validForms : undefined,
      audioUrl, !!audioUrl
    );`
);

// Reset audioUrl
code = code.replace(
  "setWordType('');\n  };",
  "setWordType('');\n    setAudioUrl(null);\n  };"
);

// Add AudioUpload component to UI
const uiTarget = `          <input 
            type="text" 
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className="w-full px-4 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary"
            placeholder="Nghĩa (Tiếng Việt) *"
          />`;
const uiReplacement = `          <input 
            type="text" 
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className="w-full px-4 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary"
            placeholder="Nghĩa (Tiếng Việt) *"
          />
          <div className="w-full p-3 bg-theme-base border border-theme-subtle">
            <span className="text-xs text-theme-primary/70 mb-2 block">Âm thanh phát âm từ vựng (không bắt buộc):</span>
            <AudioUpload 
              audioUrl={audioUrl} 
              onAudioChange={setAudioUrl} 
            />
          </div>`;
code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/components/AddVocab.tsx', code);
