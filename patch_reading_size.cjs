const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

code = code.replace(
  '<p className="text-sm text-theme-accent opacity-80 mb-1">',
  '<p className="text-xl sm:text-2xl text-theme-accent opacity-80 mb-1 font-serif">'
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
