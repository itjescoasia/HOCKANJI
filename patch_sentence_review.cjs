const fs = require('fs');
let content = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const targetBackText = `      <div 
        className={\`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center group overflow-y-auto \${!showAnswer ? 'pointer-events-none' : ''}\`}
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
        </span>`;

const newBackText = `      <div 
        className={\`absolute inset-0 bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center group overflow-y-auto \${!showAnswer ? 'pointer-events-none' : ''}\`}
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
        </span>
        
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
            className="absolute top-4 right-4 text-theme-primary/40 hover:text-theme-accent transition-colors p-2 z-[100]"
            title="Sửa ví dụ"
          >
            <Pen className="w-4 h-4" />
          </button>
        )}`;

content = content.replace(targetBackText, newBackText);

fs.writeFileSync('src/components/SentenceReview.tsx', content);
console.log("Patched back side edit button");
