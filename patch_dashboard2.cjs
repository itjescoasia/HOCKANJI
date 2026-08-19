const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const searchUI = `      {/* Search Bar */}
      <div className="relative z-[100] mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-theme-primary opacity-40" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm từ vựng..." 
          className="w-full bg-theme-panel border border-theme-subtle py-3 pl-10 pr-4 text-theme-primary placeholder-theme-primary/30 focus:outline-none focus:border-theme-accent transition-colors text-sm shadow-sm rounded-sm"
        />
        {searchQuery.trim() && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-theme-panel border border-theme-subtle shadow-xl overflow-hidden rounded-sm max-h-[300px] overflow-y-auto">
            {searchResults.map((res, i) => (
              <button 
                key={\`\${res.type}-\${res.id}-\${i}\`}
                className="w-full text-left px-4 py-3 hover:bg-theme-hover border-b border-theme-subtle last:border-b-0 flex items-center justify-between"
                onClick={() => {
                  setSearchQuery("");
                  if (onNavigateToWord) onNavigateToWord(res.word, res.type === 'intensive', res.id);
                }}
              >
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="text-sm font-serif text-theme-primary truncate">{res.word}</span>
                  <span className="text-xs text-theme-primary/60 truncate">{res.reading} {res.reading && res.meaning ? '•' : ''} {res.meaning}</span>
                </div>
                <span className={\`shrink-0 text-[10px] px-2 py-0.5 uppercase tracking-widest rounded-sm \${res.type === 'intensive' ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50'}\`}>
                  {res.type === 'intensive' ? 'Chuyên sâu' : 'Từ vựng'}
                </span>
              </button>
            ))}
          </div>
        )}
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-theme-panel border border-theme-subtle shadow-xl overflow-hidden rounded-sm px-4 py-3">
             <span className="text-xs text-theme-primary/60 italic">Không tìm thấy từ vựng nào phù hợp</span>
          </div>
        )}
      </div>
      {/* Search Bar End */}
`;

if (!code.includes('Tìm kiếm từ vựng...')) {
  code = code.replace(
    '<div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col gap-6">',
    '<div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col gap-6">\n' + searchUI
  );
  fs.writeFileSync(file, code);
  console.log("Patched correctly.");
} else {
  console.log("Already patched.");
}
