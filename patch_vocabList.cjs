const fs = require('fs');
let content = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

if (!content.includes('cleanTextForSearch')) {
    content = content.replace(
      'import { Plus, Search, Edit2, Trash2, ArrowUpDown, ChevronDown, Check, X, CheckSquare, Upload, Download } from "lucide-react";',
      'import { Plus, Search, Edit2, Trash2, ArrowUpDown, ChevronDown, Check, X, CheckSquare, Upload, Download } from "lucide-react";\nimport { cleanTextForSearch } from "../utils/stringUtils";'
    );
}

const oldFilter = `  const filteredDeck = deck.filter(c => {
    const searchLower = String(search || "").trim().toLowerCase();
    if (!searchLower) return filterType === 'all' || c.wordType === filterType;

    const stem = c.kanji ? c.kanji.replace(/[ぁ-ん]+$/, '') : '';
    
    const matchesSearch = (c.kanji && c.kanji.toLowerCase().includes(searchLower)) || 
                          (c.meaning && c.meaning.toLowerCase().includes(searchLower)) ||
                          (c.reading && c.reading.toLowerCase().includes(searchLower)) ||
                          (c.romaji && c.romaji.toLowerCase().includes(searchLower)) ||
                          (c.forms && c.forms.some(f => f.value && f.value.toLowerCase().includes(searchLower))) ||
                          (stem && stem.length > 0 && searchLower.includes(stem.toLowerCase()));
                          
    const matchesFilter = filterType === 'all' || c.wordType === filterType;
    return matchesSearch && matchesFilter;
  });`;

const newFilter = `  const filteredDeck = deck.filter(c => {
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
  });`;

content = content.replace(oldFilter, newFilter);
fs.writeFileSync('src/components/VocabList.tsx', content);
console.log("Patched VocabList.tsx");
