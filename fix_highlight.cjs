const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// I'll just write a script to completely rebuild RelatedHighlight correctly since the regex replaced multiple parts incorrectly.
