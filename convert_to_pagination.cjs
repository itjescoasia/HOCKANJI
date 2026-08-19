const fs = require('fs');
const file = 'src/components/VocabList.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace visibleCount state with currentPage
code = code.replace(
  "const [visibleCount, setVisibleCount] = useState(50);",
  "const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;"
);

// Search change
code = code.replace(
  "onChange={e => { setSearch(e.target.value); setVisibleCount(50); }}",
  "onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}"
);

// Filter change
code = code.replace(
  "onChange={(e) => { setFilterType(e.target.value); setVisibleCount(50); }}",
  "onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}"
);

// slice mapping
code = code.replace(
  "filteredDeck.slice(0, visibleCount).map((card) => {",
  "filteredDeck.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((card) => {"
);

// Replace load more button with pagination controls
const loadMoreRegex = /\{\s*visibleCount\s*<\s*filteredDeck\.length\s*&&\s*\([\s\S]*?\)\s*\}/;

const paginationControls = `{filteredDeck.length > itemsPerPage && (
            <div className="p-4 flex justify-between items-center border-t border-theme-subtle bg-theme-panel">
              <div className="text-xs text-theme-muted">
                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDeck.length)} / {filteredDeck.length} từ
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 bg-theme-base-alt text-theme-primary rounded-sm border border-theme-subtle hover:border-theme-accent transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <div className="flex items-center px-2 text-sm text-theme-primary">
                  Trang {currentPage} / {Math.ceil(filteredDeck.length / itemsPerPage)}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDeck.length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(filteredDeck.length / itemsPerPage)}
                  className="px-4 py-1.5 bg-theme-base-alt text-theme-primary rounded-sm border border-theme-subtle hover:border-theme-accent transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}`;

code = code.replace(loadMoreRegex, paginationControls);

fs.writeFileSync(file, code);
