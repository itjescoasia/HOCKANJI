const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  '<div className="flex items-start gap-2 mt-4">\n                  <HighlightProvider><p className="text-xl sm:text-2xl text-theme-primary leading-relaxed font-serif">',
  '<HighlightProvider>\n                <div className="flex items-start gap-2 mt-4">\n                  <p className="text-xl sm:text-2xl text-theme-primary leading-relaxed font-serif">'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
