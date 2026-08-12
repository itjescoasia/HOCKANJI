const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldAllMatch = `        if (f.value) {
          allMatchCandidates.push({ matchStr: f.value, card, matchedForm: f });
        }`;
const newAllMatch = `        if (f.value) {
          allMatchCandidates.push({ matchStr: f.value, card, matchedForm: f });
        }
        if (f.reading && f.reading !== f.value) {
          allMatchCandidates.push({ matchStr: f.reading, card, matchedForm: f });
        }`;

if (code.includes(oldAllMatch)) {
    code = code.replace(oldAllMatch, newAllMatch);
    fs.writeFileSync(file, code);
    console.log("Patched all match successfully");
} else {
    console.log("Not found all match");
}
