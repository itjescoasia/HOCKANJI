const fs = require('fs');
let code = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');

// Add opacity and pointer events logic to ShortStudyCard front and back
code = code.replace(
  /className="absolute inset-0 bg-theme-hover border border-theme-subtle p-8 md:p-12 rounded-lg flex flex-col items-center justify-center shadow-xl group"/g,
  `className={\`absolute inset-0 bg-theme-hover border border-theme-subtle p-8 md:p-12 rounded-lg flex flex-col items-center justify-center shadow-xl group \${isMeaningShown ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}`
);

code = code.replace(
  /className="absolute inset-0 bg-theme-hover border border-theme-subtle p-6 md:p-10 rounded-lg flex flex-col items-center shadow-xl group overflow-y-auto custom-scrollbar"/g,
  `className={\`absolute inset-0 bg-theme-hover border border-theme-subtle p-6 md:p-10 rounded-lg flex flex-col items-center shadow-xl group overflow-y-auto custom-scrollbar \${!isMeaningShown ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}`
);

// Add Webkit backface visibility
code = code.replace(
  /style={{ backfaceVisibility: "hidden" }}/g,
  `style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}`
);

code = code.replace(
  /style={{ backfaceVisibility: "hidden", transform: "rotateY\(180deg\)" }}/g,
  `style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}`
);

fs.writeFileSync('src/components/ShortStudySession.tsx', code);
