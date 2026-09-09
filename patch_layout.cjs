const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Replace top section layout
code = code.replace(
  '<h2 className="text-2xl font-serif text-theme-accent mb-2 tracking-widest uppercase">Kho từ vựng</h2>',
  '<h2 className="text-3xl font-serif text-theme-primary font-bold mb-2 tracking-tight">Kho Từ Vựng</h2>'
);

code = code.replace(
  '<div className="h-4 w-px bg-theme-active"></div>',
  '<div className="h-4 w-px bg-theme-subtle"></div>'
);

code = code.replace(
  'className="text-[10px] uppercase tracking-widest text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors flex items-center gap-1"',
  'className="text-xs font-medium text-theme-primary/60 hover:text-theme-accent bg-theme-base-alt hover:bg-theme-hover px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-theme-subtle hover:border-theme-accent/30 shadow-sm"'
);
code = code.replace(
  'className="text-[10px] uppercase tracking-widest text-theme-primary opacity-50 hover:opacity-100 hover:text-theme-accent transition-colors flex items-center gap-1"',
  'className="text-xs font-medium text-theme-primary/60 hover:text-theme-accent bg-theme-base-alt hover:bg-theme-hover px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-theme-subtle hover:border-theme-accent/30 shadow-sm"'
);

// Replace dropdown and search inputs
code = code.replace(
  'className="px-4 py-2 bg-theme-base-alt border border-theme-subtle text-theme-primary focus:outline-none focus:border-theme-accent transition-colors rounded-none text-sm w-full sm:w-auto min-w-[150px]"',
  'className="px-4 py-2.5 bg-theme-panel border border-theme-subtle text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all rounded-xl text-sm w-full sm:w-auto min-w-[160px] shadow-sm cursor-pointer hover:border-theme-accent/50"'
);

code = code.replace(
  'className="pl-11 pr-4 py-2 bg-theme-base-alt border border-theme-subtle text-theme-primary w-full sm:w-72 focus:outline-none focus:border-theme-accent transition-colors rounded-none placeholder:opacity-30 text-sm"',
  'className="pl-11 pr-4 py-2.5 bg-theme-panel border border-theme-subtle text-theme-primary w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all rounded-xl placeholder:text-theme-primary/40 text-sm shadow-sm hover:border-theme-accent/50"'
);

// Empty states
code = code.replace(
  '<div className="bg-theme-panel border border-theme-subtle p-16 text-center shadow-lg">',
  '<div className="bg-theme-panel border border-theme-subtle p-16 text-center shadow-sm rounded-2xl">'
);
code = code.replace(
  '<div className="w-16 h-16 bg-theme-hover border border-theme-subtle flex items-center justify-center mx-auto mb-6">',
  '<div className="w-20 h-20 bg-theme-accent/10 border-theme-accent/20 flex items-center justify-center mx-auto mb-6 rounded-full">'
);
code = code.replace(
  '<p className="text-lg font-serif text-theme-accent tracking-widest uppercase mb-2">Chưa có từ vựng nào</p>',
  '<p className="text-xl font-bold text-theme-primary mb-2">Chưa có từ vựng nào</p>'
);

code = code.replace(
  '<div className="bg-theme-panel border border-theme-subtle p-16 text-center">',
  '<div className="bg-theme-panel border border-theme-subtle p-16 text-center shadow-sm rounded-2xl">'
);

// Table Container and Headers
code = code.replace(
  '<div className="bg-theme-panel border border-theme-subtle overflow-hidden shadow-lg">',
  '<div className="bg-theme-panel border border-theme-subtle overflow-hidden shadow-sm sm:rounded-2xl rounded-xl">'
);

code = code.replace(
  '<tr className="bg-theme-hover border-b border-theme-subtle">',
  '<tr className="bg-theme-base-alt/50 border-b border-theme-subtle">'
);

code = code.replace(
  '<th className="px-8 py-4 text-[10px] text-theme-accent opacity-70 uppercase tracking-widest font-normal">Kanji</th>',
  '<th className="px-6 py-4 text-xs text-theme-primary/60 font-semibold tracking-wider">Từ vựng</th>'
);
code = code.replace(
  '<th className="px-8 py-4 text-[10px] text-theme-accent opacity-70 uppercase tracking-widest font-normal">Cách đọc / Nghĩa</th>',
  '<th className="px-6 py-4 text-xs text-theme-primary/60 font-semibold tracking-wider">Cách đọc / Nghĩa</th>'
);
code = code.replace(
  '<th className="px-8 py-4 text-[10px] text-theme-accent opacity-70 uppercase tracking-widest font-normal text-right">Quản lý</th>',
  '<th className="px-6 py-4 text-xs text-theme-primary/60 font-semibold tracking-wider text-right">Thao tác</th>'
);

// Table Body and Rows
code = code.replace(
  '<tbody className="divide-y divide-[#2a2a2a]">',
  '<tbody className="divide-y divide-theme-subtle">'
);

// Inside map for table row
code = code.replace(
  '<td className="px-8 py-5">',
  '<td className="px-6 py-5">'
);
code = code.replace(
  '<td className="px-8 py-5 min-w-[200px] sm:min-w-[auto]">',
  '<td className="px-6 py-5 min-w-[200px] sm:min-w-[auto]">'
);
code = code.replace(
  '<td className="px-8 py-5 min-w-[150px] align-top text-right">',
  '<td className="px-6 py-5 min-w-[150px] align-top text-right">'
);

fs.writeFileSync('src/components/VocabList.tsx', code);
