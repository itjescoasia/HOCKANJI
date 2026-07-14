const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

code = code.replace(
  /<motion\.div\n\s*className="w-full relative"\n\s*style=\{\{ transformStyle: "preserve-3d" \}\}/,
  `<motion.div
      className="w-full relative cursor-pointer"
      onClick={(e) => {
        // Prevent click if clicking on a button or link or form inside
        if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('form')) {
           return;
        }
        setShowAnswer(!showAnswer);
      }}
      style={{ transformStyle: "preserve-3d" }}`
);

// We should also add a hint to click to flip in the SentenceReview
code = code.replace(
  /<div className="mt-8 text-center text-\[10px\] uppercase tracking-widest text-theme-primary\/40 relative z-10">\n\s*Nhấn/g,
  `<div className="mt-8 text-center text-[10px] uppercase tracking-widest text-theme-primary/40 relative z-10">
            Chạm vào thẻ hoặc nhấn`
);
fs.writeFileSync('src/components/SentenceReview.tsx', code);
