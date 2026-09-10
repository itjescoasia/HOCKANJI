const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Add state
code = code.replace(
  "const [filterType, setFilterType] = useState('all');",
  "const [filterType, setFilterType] = useState('all');\n  const [audioFilter, setAudioFilter] = useState<'all' | 'has_audio' | 'no_audio'>('all');"
);

// Update dependencies
code = code.replace(
  "}, [deck, search, filterType]);",
  "}, [deck, search, filterType, audioFilter]);"
);

// Update filter logic
code = code.replace(
  /const matchesFilter = filterType === 'all' \|\| c\.wordType === filterType;\n\s*return matchesSearch && matchesFilter;/g,
  `const matchesFilter = filterType === 'all' || c.wordType === filterType;
      
      let matchesAudio = true;
      if (audioFilter === 'has_audio') {
        matchesAudio = !!c.audioUrl;
      } else if (audioFilter === 'no_audio') {
        matchesAudio = !c.audioUrl;
      }
      
      return matchesSearch && matchesFilter && matchesAudio;`
);

// Add to UI
code = code.replace(
  /<select\n\s*value=\{filterType\}\n\s*onChange=\{\(e\) => \{ setFilterType\(e\.target\.value\); setCurrentPage\(1\); \}\}/g,
  `<select
            value={audioFilter}
            onChange={(e) => { setAudioFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-theme-panel border border-theme-subtle text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all rounded-xl text-sm w-full sm:w-auto min-w-[160px] shadow-sm cursor-pointer hover:border-theme-accent/50"
          >
            <option value="all">Tất cả trạng thái MP3</option>
            <option value="has_audio">Đã có MP3</option>
            <option value="no_audio">Chưa có MP3</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}`
);

// We need to also add audioFilter logic for early return when search is empty
code = code.replace(
  "if (!q) return filterType === 'all' || c.wordType === filterType;",
  `if (!q) {
        const matchesFilter = filterType === 'all' || c.wordType === filterType;
        let matchesAudio = true;
        if (audioFilter === 'has_audio') matchesAudio = !!c.audioUrl;
        else if (audioFilter === 'no_audio') matchesAudio = !c.audioUrl;
        return matchesFilter && matchesAudio;
      }`
);

fs.writeFileSync('src/components/VocabList.tsx', code);
