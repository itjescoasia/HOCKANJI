const fs = require('fs');
const file = 'src/components/VocabList.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `  const filteredDeck = deck.filter(c => {
    const q = String(search || "").trim();
    if (!q) return filterType === 'all' || c.wordType === filterType;
    
    const cleanQ = cleanTextForSearch(q);
    const queryWords = cleanQ.split(/\\s+/).filter(Boolean);

    const stem = c.kanji ? c.kanji.replace(/[ぁ-ん]+$/, '') : '';
    
    const k = cleanTextForSearch(c.kanji);
    const m = cleanTextForSearch(c.meaning);
    const r = cleanTextForSearch(c.reading);
    const ro = cleanTextForSearch(c.romaji);
    const stemClean = cleanTextForSearch(stem);
    
    const textToSearch = \`\${k} \${m} \${r} \${ro}\`;

    let matchesSearch = textToSearch.includes(cleanQ) || (stemClean && stemClean.length > 0 && cleanQ.includes(stemClean));
    
    if (!matchesSearch && queryWords.length > 0) {
        const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
        matchesSearch = (matchCount / queryWords.length) >= 0.7;
    }
    
    if (!matchesSearch && c.forms) {
        matchesSearch = c.forms.some(f => f.value && cleanTextForSearch(f.value).includes(cleanQ));
    }
                          
    const matchesFilter = filterType === 'all' || c.wordType === filterType;
    return matchesSearch && matchesFilter;
  });

  const uniqueWordTypes = Array.from(new Set(deck.map(c => c.wordType).filter(Boolean)));`;

const replacement = `  const filteredDeck = React.useMemo(() => {
    return deck.filter(c => {
      const q = String(search || "").trim();
      if (!q) return filterType === 'all' || c.wordType === filterType;
      
      const cleanQ = cleanTextForSearch(q);
      const queryWords = cleanQ.split(/\\s+/).filter(Boolean);

      const stem = c.kanji ? c.kanji.replace(/[ぁ-ん]+$/, '') : '';
      
      const k = cleanTextForSearch(c.kanji);
      const m = cleanTextForSearch(c.meaning);
      const r = cleanTextForSearch(c.reading);
      const ro = cleanTextForSearch(c.romaji);
      const stemClean = cleanTextForSearch(stem);
      
      const textToSearch = \`\${k} \${m} \${r} \${ro}\`;

      let matchesSearch = textToSearch.includes(cleanQ) || (stemClean && stemClean.length > 0 && cleanQ.includes(stemClean));
      
      if (!matchesSearch && queryWords.length > 0) {
          const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
          matchesSearch = (matchCount / queryWords.length) >= 0.7;
      }
      
      if (!matchesSearch && c.forms) {
          matchesSearch = c.forms.some(f => f.value && cleanTextForSearch(f.value).includes(cleanQ));
      }
                            
      const matchesFilter = filterType === 'all' || c.wordType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [deck, search, filterType]);

  const uniqueWordTypes = React.useMemo(() => {
    return Array.from(new Set(deck.map(c => c.wordType).filter(Boolean)));
  }, [deck]);`;

if (code.includes('const filteredDeck = deck.filter')) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Patched successfully");
} else {
  console.log("Could not find target block");
}
