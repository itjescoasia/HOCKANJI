const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(/<td className="px-8 py-5">/g, '<td className="px-6 py-5">');
code = code.replace(/<td className="px-8 py-5 min-w-\[200px\] sm:min-w-\[auto\]">/g, '<td className="px-6 py-5 min-w-[200px] sm:min-w-[auto]">');
code = code.replace(/<td className="px-8 py-5 min-w-\[150px\] align-top text-right">/g, '<td className="px-6 py-5 min-w-[150px] align-top text-right">');

// Make the Kanji text look a bit nicer and friendlier
code = code.replace(/<div className="text-3xl font-serif text-theme-primary">/g, '<div className="text-3xl font-serif text-theme-primary bg-theme-base-alt px-3 py-1.5 rounded-xl shadow-sm border border-theme-subtle/50 inline-block">');

// Make the badges rendering inside row (getWordTypeBadgeStyle is already updated, but we might want to ensure they look good)
code = code.replace(
  '<div className="bg-theme-panel border border-theme-subtle overflow-hidden shadow-sm sm:rounded-2xl rounded-xl">',
  '<div className="bg-theme-panel border border-theme-subtle overflow-hidden shadow-md sm:rounded-[20px] rounded-xl">'
);

fs.writeFileSync('src/components/VocabList.tsx', code);
