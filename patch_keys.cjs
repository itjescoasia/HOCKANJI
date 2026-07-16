const fs = require('fs');
let file = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

file = file.replace(
`                    key={word.id}`,
`                    key={word.id || 'w-' + index}`); // wait, index is not defined there.
