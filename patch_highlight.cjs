const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCheck = `    let isMatch = example.includes(wordStr);
    
    if (!isMatch && card.kanji) {`;
const newCheck = `    let isMatch = example.includes(wordStr);
    
    if (!isMatch && card.reading && example.includes(card.reading)) {
      isMatch = true;
    }
    
    if (!isMatch && card.kanji) {`;

if (code.includes(oldCheck)) {
    code = code.replace(oldCheck, newCheck);
    fs.writeFileSync(file, code);
    console.log("Patched successfully");
} else {
    console.log("Not found");
}
