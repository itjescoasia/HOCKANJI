const fs = require('fs');
let file = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');
file = file.replace(/reading: '', romaji: ''/g, "reading: '', romaji: '', meaning: ''");
fs.writeFileSync('src/components/AddVocab.tsx', file);

let stats = fs.readFileSync('src/hooks/useStudyStats.ts', 'utf8');
stats = stats.replace(/export interface DailyStats \{/g, "export interface DailyStats {\n  remembered?: number;\n  wotdId?: string;");
fs.writeFileSync('src/hooks/useStudyStats.ts', stats);
console.log("Fixed TS errors");
