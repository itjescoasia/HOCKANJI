const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  '<div className="bg-theme-base w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col relative custom-scrollbar" onClick={e => e.stopPropagation()}>',
  '<div className="bg-theme-base w-full max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-[24px] rounded-2xl shadow-2xl flex flex-col relative custom-scrollbar border border-theme-subtle/50" onClick={e => e.stopPropagation()}>'
);

code = code.replace(
  '<div className="p-8 sm:p-10 border-b border-theme-subtle relative bg-theme-panel">',
  '<div className="p-8 sm:p-10 border-b border-theme-subtle relative bg-theme-panel/50 rounded-t-2xl sm:rounded-t-[24px]">'
);

fs.writeFileSync('src/components/VocabList.tsx', code);
