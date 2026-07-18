const fs = require('fs');
let file = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// Replace the span in RelatedHighlight manualMatch
file = file.replace(
  '<span className="px-1 rounded transition-all duration-200 bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative">',
  '<span className="rounded transition-all duration-200 bg-theme-accent text-white shadow-sm relative">'
);

// Replace the span in RelatedHighlight map
file = file.replace(
  /className=\{`px-1 rounded transition-all duration-200 \$\{isCurrentMatch \? 'bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative' : 'bg-theme-accent\/20 text-theme-accent font-bold'\}`\}/g,
  'className={`rounded transition-colors duration-200 ${isCurrentMatch ? \'bg-theme-accent text-white shadow-sm relative z-10\' : \'bg-theme-accent/20 text-theme-accent\'}`}'
);

// Do the same for HighlightVietnamese
file = file.replace(
  '<span className="px-1 rounded transition-all duration-200 bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative">',
  '<span className="rounded transition-colors duration-200 bg-theme-accent text-white shadow-sm relative z-10">'
);

file = file.replace(
  /className=\{`px-1 rounded transition-all duration-200 \$\{isCurrentMatch \? 'bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative' : 'bg-theme-accent\/20 text-theme-accent font-bold'\}`\}/g,
  'className={`rounded transition-colors duration-200 ${isCurrentMatch ? \'bg-theme-accent text-white shadow-sm relative z-10\' : \'bg-theme-accent/20 text-theme-accent\'}`}'
);

fs.writeFileSync('src/utils/highlight.tsx', file);
console.log('Patched highlight.tsx');
