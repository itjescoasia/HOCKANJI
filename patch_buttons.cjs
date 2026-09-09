const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Action buttons in the table row
code = code.replace(
  '<td className="px-8 py-5 text-right whitespace-nowrap">',
  '<td className="px-6 py-5 text-right whitespace-nowrap">'
);

code = code.replace(
  /className="p-2 text-\[#555\] hover:text-blue-500 transition-colors inline-flex items-center justify-center opacity-70 hover:opacity-100 mr-1"/g,
  'className="p-2 hover:bg-blue-500/10 text-theme-primary/40 hover:text-blue-500 transition-all rounded-xl inline-flex items-center justify-center mr-1"'
);

code = code.replace(
  /className="p-2 text-\[#555\] hover:text-theme-accent transition-colors inline-flex items-center justify-center opacity-70 hover:opacity-100 mr-1"/g,
  'className="p-2 hover:bg-theme-accent/10 text-theme-primary/40 hover:text-theme-accent transition-all rounded-xl inline-flex items-center justify-center mr-1"'
);

code = code.replace(
  /className="p-2 text-\[#555\] hover:text-red-500 transition-colors inline-flex items-center justify-center opacity-70 hover:opacity-100"/g,
  'className="p-2 hover:bg-red-500/10 text-theme-primary/40 hover:text-red-500 transition-all rounded-xl inline-flex items-center justify-center"'
);

// Pagination container and buttons
code = code.replace(
  '<div className="p-4 flex items-center justify-between border-t border-theme-subtle">',
  '<div className="p-4 flex items-center justify-between border-t border-theme-subtle/50 bg-theme-base-alt/30">'
);

code = code.replace(
  /className="px-4 py-1.5 bg-theme-base border border-theme-subtle hover:bg-theme-hover disabled:opacity-50 disabled:hover:bg-theme-base text-theme-primary transition-colors text-sm rounded-sm"/g,
  'className="px-4 py-2 bg-theme-panel border border-theme-subtle hover:bg-theme-hover hover:border-theme-accent/50 disabled:opacity-50 disabled:hover:bg-theme-panel text-theme-primary transition-all text-sm rounded-xl shadow-sm"'
);

fs.writeFileSync('src/components/VocabList.tsx', code);
