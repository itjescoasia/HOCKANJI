const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

// The `)}` before `</div>` is matching `{!isEditing && (`.
// Because I overwrote it in patch_sentence4.cjs:
// I replaced `</div>\n<div className="mt-12 ...` with `</div>\n</motion.div>\n</AnimatePresence>\n<div className="mt-12...`
// Wait, if I overwrote `{!isEditing && (`, I need to put it back!

// Let me just remove the `)}` at the end and see if it builds.
// Wait, if it WAS `{!isEditing && (`, then if I just remove `)}`, the buttons will show even when editing. Which is fine, but maybe it should be `{!isEditing && (`.

code = code.replace(
  /<\/AnimatePresence>\n<div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">/g,
  `</AnimatePresence>\n{!isEditing && (\n<div className="mt-12 flex items-center justify-center gap-4 w-full max-w-2xl">`
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
