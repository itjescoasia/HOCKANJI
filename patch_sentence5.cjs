const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /<\/div>\n<div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">/g,
  `</div>\n</motion.div>\n</AnimatePresence>\n<div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
