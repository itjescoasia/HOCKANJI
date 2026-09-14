const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('isAddModalOpen')) {
  // 1. Add state
  const stateMatch = `const [view, setView] = useState('dashboard');`;
  code = code.replace(stateMatch, stateMatch + `\n  const [isAddModalOpen, setIsAddModalOpen] = useState(false);`);

  // 2. Modify handleNavigate
  const handleNavMatch = `  const handleNavigate = (newView: string) => {
    // The active time saving is handled by the unmount effect of the tracker above
    if (isFreeStudyMode || isDifficultReviewMode) {`;
  code = code.replace(handleNavMatch, `  const handleNavigate = (newView: string) => {
    // The active time saving is handled by the unmount effect of the tracker above
    if (newView === 'add') {
      setIsAddModalOpen(true);
      return;
    }
    if (isFreeStudyMode || isDifficultReviewMode) {`);

  // 3. Add modal in JSX and remove {view === 'add' && <AddVocab ... />}
  const viewAddMatch = `        {view === 'add' && (
          <AddVocab 
            deck={deck}
            onNavigateToWord={(kanji) => {
              setListSearchQuery(kanji);
              setView('list');
            }}
            onAdd={async (kanji, reading, meaning, sinoVietnamese, examples, wordType, kanjiExplanation, romaji, forms, audioUrl, hasAudio) => {
              await addCard(kanji, reading, meaning, sinoVietnamese || '', '', '', wordType || '', kanjiExplanation || '', romaji || '', examples || [], forms || [], audioUrl, hasAudio);
              alert('Vừa thêm từ vựng mới thành công');
              handleNavigate('list'); // Redirect to list to show success
            }} 
          />
        )}`;

  const modalReplacement = `        {/* Modals */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-theme-panel w-full max-w-2xl my-auto rounded-xl shadow-2xl border border-theme-subtle">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[20001] p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-2 sm:p-4 max-h-[90vh] overflow-y-auto">
                <AddVocab 
                  deck={deck}
                  onNavigateToWord={(kanji) => {
                    setListSearchQuery(kanji);
                    setIsAddModalOpen(false);
                    setView('list');
                  }}
                  onAdd={async (kanji, reading, meaning, sinoVietnamese, examples, wordType, kanjiExplanation, romaji, forms, audioUrl, hasAudio) => {
                    await addCard(kanji, reading, meaning, sinoVietnamese || '', '', '', wordType || '', kanjiExplanation || '', romaji || '', examples || [], forms || [], audioUrl, hasAudio);
                    alert('Vừa thêm từ vựng mới thành công');
                    setIsAddModalOpen(false);
                  }} 
                />
              </div>
            </div>
          </div>
        )}`;

  code = code.replace(viewAddMatch, modalReplacement);
  
  // also add X icon import if not present
  if (!code.includes('import { X ')) {
     code = code.replace('import { Home, BookMarked,', 'import { Home, BookMarked, X,');
  }

  fs.writeFileSync('src/App.tsx', code);
}
