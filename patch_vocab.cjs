const fs = require('fs');
let file = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

file = file.replace(
`    const matchesSearch = c.kanji.toLowerCase().includes(searchLower) || 
                          c.meaning.toLowerCase().includes(searchLower) ||
                          c.reading.toLowerCase().includes(searchLower) ||
                          (c.romaji && c.romaji.toLowerCase().includes(searchLower)) ||
                          (c.forms && c.forms.some(f => f.value.toLowerCase().includes(searchLower))) ||
                          (stem && stem.length > 0 && searchLower.includes(stem.toLowerCase()));`,
`    const matchesSearch = (c.kanji && c.kanji.toLowerCase().includes(searchLower)) || 
                          (c.meaning && c.meaning.toLowerCase().includes(searchLower)) ||
                          (c.reading && c.reading.toLowerCase().includes(searchLower)) ||
                          (c.romaji && c.romaji.toLowerCase().includes(searchLower)) ||
                          (c.forms && c.forms.some(f => f.value && f.value.toLowerCase().includes(searchLower))) ||
                          (stem && stem.length > 0 && searchLower.includes(stem.toLowerCase()));`);

fs.writeFileSync('src/components/VocabList.tsx', file);
