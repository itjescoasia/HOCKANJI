const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

content = content.replace(
  'import { normalizeSentence } from "../utils/stringUtils";',
  'import { normalizeSentence, cleanTextForSearch } from "../utils/stringUtils";'
);

const oldFilteredDeck = `  const filteredDeck = React.useMemo(() => {
    const q = String(searchQuery || "").trim();
    if (!q) return deck;
    
    let results = fuse.search(q).map((result) => result.item);
    const existingIds = new Set(results.map(r => r.id));
    
    // Fallback: manually check substring matches to ensure they are always found
    const lowerQ = q.toLowerCase();
    deck.forEach(item => {
        if (!existingIds.has(item.id)) {
            const isMatch = (item.word && item.word.toLowerCase().includes(lowerQ)) ||
                            (item.reading && item.reading.toLowerCase().includes(lowerQ)) ||
                            (item.romaji && item.romaji.toLowerCase().includes(lowerQ)) ||
                            (item.examples || []).some(ex => 
                                 (ex.sentence && ex.sentence.toLowerCase().includes(lowerQ)) ||
                                (ex.reading && ex.reading.toLowerCase().includes(lowerQ)) ||
                                (ex.translation && ex.translation.toLowerCase().includes(lowerQ))
                            );
            if (isMatch) {
                results.push(item);
                existingIds.add(item.id);
            }
        }
    });`;

const newFilteredDeck = `  const filteredDeck = React.useMemo(() => {
    const q = String(searchQuery || "").trim();
    if (!q) return deck;
    
    let results = fuse.search(q).map((result) => result.item);
    const existingIds = new Set(results.map(r => r.id));
    
    // Smart Fallback
    const cleanQ = cleanTextForSearch(q);
    const queryWords = cleanQ.split(/\\s+/).filter(Boolean);
    
    deck.forEach(item => {
        if (!existingIds.has(item.id)) {
            const w = cleanTextForSearch(item.word);
            const r = cleanTextForSearch(item.reading);
            const ro = cleanTextForSearch(item.romaji);
            
            const matchInMain = (w && w.includes(cleanQ)) || (r && r.includes(cleanQ)) || (ro && ro.includes(cleanQ));
            
            let isMatch = matchInMain;
            
            if (!isMatch && item.examples) {
                isMatch = item.examples.some(ex => {
                    const exS = cleanTextForSearch(ex.sentence);
                    const exR = cleanTextForSearch(ex.reading);
                    const exT = cleanTextForSearch(ex.translation);
                    const textToSearch = \`\${exS} \${exR} \${exT}\`;
                    
                    if (textToSearch.includes(cleanQ)) return true;
                    
                    if (queryWords.length > 0) {
                        const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
                        return (matchCount / queryWords.length) >= 0.7; // At least 70% of words must match
                    }
                    return false;
                });
            }
            
            if (isMatch) {
                results.push(item);
                existingIds.add(item.id);
            }
        }
    });`;

content = content.replace(oldFilteredDeck, newFilteredDeck);


const oldExamplesSearch = `                                {searchQuery.trim() !== "" && (() => {
                                  const q = searchQuery.trim().toLowerCase();
                                  
                                  // normalize function to ignore accents
                                  const cleanText = (str) => {
                                    if (!str) return "";
                                    return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9 ]/g, " ").replace(/\\s+/g, " ").trim();
                                  };
                                  
                                  const cleanQ = cleanText(q);
                                  const queryWords = cleanQ.split(/\\s+/).filter(Boolean);
                                  
                                  const matchedExamples = word.examples.filter(ex => {
                                    const s = cleanText(ex.sentence);
                                    const r = cleanText(ex.reading);
                                    const t = cleanText(ex.translation);
                                    const textToSearch = \`\${s} \${r} \${t}\`;
                                    
                                    if (textToSearch.includes(cleanQ)) return true;
                                    
                                    if (queryWords.length > 0) {
                                      const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
                                      return (matchCount / queryWords.length) >= 0.6;
                                    }
                                    return false;
                                  });`;

const newExamplesSearch = `                                {searchQuery.trim() !== "" && (() => {
                                  const q = searchQuery.trim();
                                  
                                  const cleanQ = cleanTextForSearch(q);
                                  const queryWords = cleanQ.split(/\\s+/).filter(Boolean);
                                  
                                  const matchedExamples = word.examples.filter(ex => {
                                    const s = cleanTextForSearch(ex.sentence);
                                    const r = cleanTextForSearch(ex.reading);
                                    const t = cleanTextForSearch(ex.translation);
                                    const textToSearch = \`\${s} \${r} \${t}\`;
                                    
                                    if (textToSearch.includes(cleanQ)) return true;
                                    
                                    if (queryWords.length > 0) {
                                      const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
                                      return (matchCount / queryWords.length) >= 0.7; // At least 70% match
                                    }
                                    return false;
                                  });`;
                                  
content = content.replace(oldExamplesSearch, newExamplesSearch);

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
console.log("Patched IntensiveStudy.tsx");
