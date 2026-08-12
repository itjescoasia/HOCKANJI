const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCheck = `    if (!isMatch && card.reading && example.includes(card.reading)) {`;
const newCheck = `    if (!isMatch && card.reading && card.reading.length > 1 && example.includes(card.reading)) {`;

if (code.includes(oldCheck)) {
    code = code.replace(oldCheck, newCheck);
    fs.writeFileSync(file, code);
    console.log("Patched successfully");
} else {
    console.log("Not found");
}
