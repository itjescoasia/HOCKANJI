const fs = require('fs');

let conv = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');
conv = conv.replace(
  /className=\{\`relative rounded-lg border \$\{snapshot\.isDragging \? "border-theme-accent shadow-2xl z-50" : "border-theme-subtle"\} bg-theme-panel group mb-4\`\}/g,
  'className={`relative rounded-lg border ${snapshot.isDragging ? "border-theme-accent shadow-2xl z-50" : "border-theme-subtle hover:z-40 focus-within:z-40"} bg-theme-panel group mb-4`}'
);
fs.writeFileSync('src/components/ConversationView.tsx', conv);

let intn = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
intn = intn.replace(
  /className=\{\`relative rounded-lg border transition-all duration-500 \$\{snapshot\.isDragging \? "border-theme-accent shadow-2xl z-50" : "border-theme-subtle"\} \$\{highlightedExampleId === ex\.id \? "ring-2 ring-red-500 shadow-lg shadow-red-500\/20" : ""\} bg-theme-panel group mb-4\`\}/g,
  'className={`relative rounded-lg border transition-all duration-500 ${snapshot.isDragging ? "border-theme-accent shadow-2xl z-50" : "border-theme-subtle hover:z-40 focus-within:z-40"} ${highlightedExampleId === ex.id ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20" : ""} bg-theme-panel group mb-4`}'
);
fs.writeFileSync('src/components/IntensiveStudy.tsx', intn);
