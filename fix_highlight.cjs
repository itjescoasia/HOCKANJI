const fs = require('fs');

let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// I will extract the whole span block and replace it correctly
// The block starts at `      <AnimatePresence>`
// And there is some trailing stuff.
// Actually, I can just restore it using git checkout and do it again safely.

