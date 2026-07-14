const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

// 1. Add motion and preserve-3d stuff
code = code.replace(
  /<div className="bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative group">/g,
  `
  <div className="w-full relative" style={{ perspective: "1000px" }}>
    <motion.div
      className="w-full relative"
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateY: showAnswer ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 20 }}
    >
      {/* Front */}
      <div 
        className={\`bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative group \${showAnswer ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}\`}
        style={{ backfaceVisibility: "hidden" }}
      >
  `
);

// 2. The front content needs to be closed, and the back content needs to be created.
// Currently it expands with a div for showAnswer:
// <div className={`w-full transition-all duration-300 ${showAnswer ? "opacity-100 mt-4 border-t border-theme-subtle pt-8" : "opacity-0 h-0 overflow-hidden"}`}>

code = code.replace(
  /<div\n\s*className=\{\`w-full transition-all duration-300 \$\{showAnswer \? "opacity-100 mt-4 border-t border-theme-subtle pt-8" : "opacity-0 h-0 overflow-hidden"\}\`\}\n\s*>/g,
  `
      </div>

      {/* Back */}
      <div 
        className={\`bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative group \${!showAnswer ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}\`}
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
        </span>
        <div className="w-full flex flex-col items-center justify-center min-h-[150px]">
  `
);

// 3. Close the motion.div and wrapping div at the very end of the card.
// The card ends after the hint block and the edit block.
// Wait, the original card ended after the <div className="mt-6 pt-6...
code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\{showAnswer/g,
  `
        </div>
      </div>
    </motion.div>
  </div>
  {showAnswer
  `
);

fs.writeFileSync('src/components/SentenceReview.tsx', code);
