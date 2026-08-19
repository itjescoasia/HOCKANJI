const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = `function StudyView({
  deck,
  word,
  targetExampleId,
  onCopyExample,
  onBack,
  onUpdateWord,
  renderHighlight,
  onStartTopicReview,
}: {
  deck: IntensiveWord[];
  word: IntensiveWord;
  targetExampleId?: string | null;
  onCopyExample: (example: IntensiveExample, targetWordId: string) => void;
  onBack: () => void;
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void;
  renderHighlight: (text: string | undefined | null, kanji: string) => React.ReactNode;
  onStartTopicReview?: (topicDeck: IntensiveWord[]) => void;
}) {`;

const replacement1 = `function StudyView({
  deck,
  word,
  targetExampleId,
  searchQuery,
  onCopyExample,
  onBack,
  onUpdateWord,
  renderHighlight,
  onStartTopicReview,
}: {
  deck: IntensiveWord[];
  word: IntensiveWord;
  targetExampleId?: string | null;
  searchQuery?: string;
  onCopyExample: (example: IntensiveExample, targetWordId: string) => void;
  onBack: () => void;
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void;
  renderHighlight: (text: string | undefined | null, kanji: string) => React.ReactNode;
  onStartTopicReview?: (topicDeck: IntensiveWord[]) => void;
}) {
  const highlightSearchTerm = (text: string | undefined | null, highlight?: string) => {
    if (!text) return "";
    if (!highlight || !highlight.trim()) return text;
    const escapedHighlight = highlight.trim().replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
    const regex = new RegExp(\`(\${escapedHighlight})\`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.trim().toLowerCase()
        ? <mark key={i} className="bg-theme-accent/20 text-theme-accent font-bold px-0.5 rounded-sm">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };
`;

const target2 = `                                  {ex.translation &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-primary/50 italic mb-2">
                                        (<HighlightVietnamese text={ex.translation || ""} />)
                                      </p>
                                    )}`;

const replacement2 = `                                  {ex.translation &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-primary/50 italic mb-2">
                                        (<span>
                                          {searchQuery 
                                            ? highlightSearchTerm(ex.translation || "", searchQuery) 
                                            : <HighlightVietnamese text={ex.translation || ""} />}
                                        </span>)
                                      </p>
                                    )}`;

const target3 = `          <StudyView
            deck={deck}
            word={selectedWord}
            targetExampleId={targetExampleId || undefined}`;

const replacement3 = `          <StudyView
            deck={deck}
            word={selectedWord}
            searchQuery={searchQuery}
            targetExampleId={targetExampleId || undefined}`;

let patched = false;
if (code.includes(target1) && code.includes(target2) && code.includes(target3)) {
  code = code.replace(target1, replacement1);
  code = code.replace(target2, replacement2);
  code = code.replace(target3, replacement3);
  patched = true;
} else {
  console.log("Targets not found.");
  if (!code.includes(target1)) console.log("Target 1 missing.");
  if (!code.includes(target2)) console.log("Target 2 missing.");
  if (!code.includes(target3)) console.log("Target 3 missing.");
}

if (patched) {
  fs.writeFileSync(file, code);
  console.log("Patched successfully.");
}
