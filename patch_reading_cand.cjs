const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCheck = `    if (card.reading && card.reading !== card.kanji) allMatchCandidates.push({ matchStr: card.reading, card });`;
const newCheck = `    if (card.reading && card.reading !== card.kanji && (card.reading.length > 1 || !card.kanji)) allMatchCandidates.push({ matchStr: card.reading, card });`;

if (code.includes(oldCheck)) {
    code = code.replace(oldCheck, newCheck);
    fs.writeFileSync(file, code);
    console.log("Patched successfully");
} else {
    console.log("Not found");
}
