const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

// Fix explanation
content = content.replace(
  'className="text-theme-primary/90 text-sm sm:text-base leading-relaxed bg-theme-hover/50 p-5 rounded-lg border border-theme-subtle border-l-4 border-l-[#c5a059] mt-3 shadow-inner max-h-64 overflow-y-auto custom-scrollbar markdown-body"',
  'className="text-theme-primary/90 text-sm sm:text-base leading-relaxed bg-theme-hover/50 p-5 rounded-lg border border-theme-subtle border-l-4 border-l-[#c5a059] mt-3 shadow-inner max-h-64 overflow-y-auto custom-scrollbar markdown-body whitespace-pre-wrap"'
);

// Fix specialNote
content = content.replace(
  'className="relative z-10 text-[15px] text-theme-primary/80 leading-relaxed font-serif markdown-body"',
  'className="relative z-10 text-[15px] text-theme-primary/80 leading-relaxed font-serif markdown-body whitespace-pre-wrap"'
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
