const fs = require('fs');
const file = 'src/components/VocabList.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace visibleCount with currentPage
code = code.replace(
  "const [visibleCount, setVisibleCount] = useState(50);",
  "const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;"
);

// Reset pagination on search and filter
code = code.replace(
  'onChange={e => { setSearch(e.target.value); setVisibleCount(50); }}',
  'onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}'
);
code = code.replace(
  'onChange={(e) => { setFilterType(e.target.value); setVisibleCount(50); }}',
  'onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}'
);

// We need to find the map loop to replace it
const mapRegex = /\{filteredDeck\.slice\([^)]+\)\.map\(\(card\) => \{/;
if (mapRegex.test(code)) {
    code = code.replace(mapRegex, '{filteredDeck.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((card) => {');
} else {
    code = code.replace(
        '{filteredDeck.map((card) => {',
        '{filteredDeck.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((card) => {'
    );
}


// Replace the "load more" button with pagination controls
const loadMoreBtnStart = code.indexOf('{visibleCount < filteredDeck.length &&');
if (loadMoreBtnStart !== -1) {
    const loadMoreBtnEnd = code.indexOf('</div>', loadMoreBtnStart + 100);
    const paginationControls = `
          {filteredDeck.length > itemsPerPage && (
            <div className="p-4 flex items-center justify-between border-t border-theme-subtle">
              <div className="text-xs text-theme-muted">
                Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDeck.length)} - {Math.min(currentPage * itemsPerPage, filteredDeck.length)} trong {filteredDeck.length} từ
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-4 py-1.5 bg-theme-base border border-theme-subtle hover:bg-theme-hover disabled:opacity-50 disabled:hover:bg-theme-base text-theme-primary transition-colors text-sm rounded-sm"
                >
                  Trước
                </button>
                <button
                  disabled={currentPage >= Math.ceil(filteredDeck.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredDeck.length / itemsPerPage), prev + 1))}
                  className="px-4 py-1.5 bg-theme-base border border-theme-subtle hover:bg-theme-hover disabled:opacity-50 disabled:hover:bg-theme-base text-theme-primary transition-colors text-sm rounded-sm"
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
`;
    // We have to be careful with string replacement here.
    const oldBtnMatch = /\{visibleCount < filteredDeck\.length && \([\s\S]*?<\/div>\s*\)\}/;
    if (oldBtnMatch.test(code)) {
       code = code.replace(oldBtnMatch, paginationControls);
    } else {
       // manual replacement
       // find the end of the table
       const tableEnd = code.indexOf('</table>');
       if (tableEnd !== -1) {
           const divEnd = code.indexOf('</div>', tableEnd);
           const beforeBtn = code.substring(0, tableEnd + 8);
           const afterBtn = code.substring(divEnd);
           // Let's just try replacing by regex
           code = code.replace(/\{visibleCount < filteredDeck\.length[\s\S]*?\)\}/, paginationControls);
           
           if (!code.includes('filteredDeck.length > itemsPerPage')) {
               // Fallback if regex fails
               code = code.replace('</table>', '</table>' + paginationControls);
           }
       }
    }
} else {
    // If we didn't find the load more button, we just add pagination after the table
    if (!code.includes('filteredDeck.length > itemsPerPage')) {
         const paginationControls = `
          {filteredDeck.length > itemsPerPage && (
            <div className="p-4 flex items-center justify-between border-t border-theme-subtle">
              <div className="text-xs text-theme-muted">
                Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDeck.length)} - {Math.min(currentPage * itemsPerPage, filteredDeck.length)} trong {filteredDeck.length} từ
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-4 py-1.5 bg-theme-base border border-theme-subtle hover:bg-theme-hover disabled:opacity-50 disabled:hover:bg-theme-base text-theme-primary transition-colors text-sm rounded-sm"
                >
                  Trước
                </button>
                <button
                  disabled={currentPage >= Math.ceil(filteredDeck.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredDeck.length / itemsPerPage), prev + 1))}
                  className="px-4 py-1.5 bg-theme-base border border-theme-subtle hover:bg-theme-hover disabled:opacity-50 disabled:hover:bg-theme-base text-theme-primary transition-colors text-sm rounded-sm"
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
`;
         code = code.replace('</table>', '</table>' + paginationControls);
         // Ensure we remove old button code
         code = code.replace(/\{visibleCount < filteredDeck\.length && \([\s\S]*?<\/div>\s*\)\}/g, '');
    }
}

// Ensure the map function uses currentPage
if (!code.includes('{filteredDeck.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(')) {
    code = code.replace(
        /\{filteredDeck(\.slice\([^)]+\))?\.map\(\(card\) => \{/,
        '{filteredDeck.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((card) => {'
    );
}

fs.writeFileSync(file, code);
console.log("Patched VocabList successfully");
