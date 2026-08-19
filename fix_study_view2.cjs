const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldTarget = `}) {
  const highlightSearchTerm = (text: string | undefined | null, highlight?: string) => {
    if (!text) return "";
    if (!highlight || !highlight.trim()) return text;
    const escapedHighlight = highlight.trim().replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\function StudyView({
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
}) {');
    const regex = new RegExp(\`(\${escapedHighlight})\`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.trim().toLowerCase()`;

const newTarget = `}) {
  const highlightSearchTerm = (text: string | undefined | null, highlight?: string) => {
    if (!text) return "";
    if (!highlight || !highlight.trim()) return text;
    const escapedHighlight = highlight.trim().replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
    const regex = new RegExp(\`(\${escapedHighlight})\`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.trim().toLowerCase()`;

// We use generic replace
code = code.replace(/const escapedHighlight = highlight\.trim\(\)\.replace\(.*?\);/s, "const escapedHighlight = highlight.trim().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');");

fs.writeFileSync(file, code);
