const fs = require('fs');
let content = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Fix kanjiExplanation
content = content.replace(
  'className="mt-2 text-xs text-theme-primary font-sans opacity-80 leading-relaxed w-full sm:min-w-[300px] lg:min-w-[500px] markdown-body"',
  'className="mt-2 text-xs text-theme-primary font-sans opacity-80 leading-relaxed w-full sm:min-w-[300px] lg:min-w-[500px] markdown-body whitespace-pre-wrap"'
);

fs.writeFileSync('src/components/VocabList.tsx', content);
