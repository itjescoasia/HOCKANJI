const fs = require('fs');
const file = 'src/components/VocabList.tsx';
let code = fs.readFileSync(file, 'utf8');

// The main optimization here is to limit the number of items rendered
// by default, or implement a simple pagination / virtualization.
// We can easily slice filteredDeck to only show the first 50 items and add a "Load More" button.

const renderTableStart = `        <div className="bg-theme-panel border border-theme-subtle rounded-sm overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse min-w-[600px]">`;

if (code.includes('filteredDeck.map((card) => {') && !code.includes('const [visibleCount, setVisibleCount] =')) {
  // Add state for visible items
  code = code.replace(
    "const [filterType, setFilterType] = useState('all');",
    "const [filterType, setFilterType] = useState('all');\n  const [visibleCount, setVisibleCount] = useState(50);"
  );

  // Reset visibleCount when search changes
  code = code.replace(
    'value={search}',
    'value={search}\n              onChange={e => { setSearch(e.target.value); setVisibleCount(50); }}'
  );
  code = code.replace(
    "onChange={(e) => setFilterType(e.target.value)}",
    "onChange={(e) => { setFilterType(e.target.value); setVisibleCount(50); }}"
  );

  // Apply slice to map
  code = code.replace(
    'filteredDeck.map((card) => {',
    'filteredDeck.slice(0, visibleCount).map((card) => {'
  );

  // Add load more button
  const loadMoreBtn = `            </tbody>
          </table>
          {visibleCount < filteredDeck.length && (
            <div className="p-4 flex justify-center border-t border-theme-subtle">
              <button onClick={() => setVisibleCount(prev => prev + 50)} className="px-6 py-2 bg-theme-hover text-theme-primary rounded-sm border border-theme-subtle hover:border-theme-accent transition-colors text-sm">Hiển thị thêm</button>
            </div>
          )}
        </div>`;
  
  code = code.replace(
    '            </tbody>\n          </table>\n        </div>',
    loadMoreBtn
  );
  
  fs.writeFileSync(file, code);
  console.log("Patched VocabList successfully");
} else {
  console.log("Could not patch VocabList");
}
