const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('initialSearchQuery?: string;')) {
  code = code.replace(
    'onReorderDeck?: (deck: IntensiveWord[]) => void;',
    'onReorderDeck?: (deck: IntensiveWord[]) => void;\n  initialSearchQuery?: string;\n  initialSelectedWordId?: string | null;'
  );
}

if (!code.includes('initialSearchQuery = "",')) {
  code = code.replace(
    '  onReorderDeck,\n  onStartTopicReview,\n}: IntensiveStudyProps) {',
    '  onReorderDeck,\n  onStartTopicReview,\n  initialSearchQuery = "",\n  initialSelectedWordId = null,\n}: IntensiveStudyProps) {'
  );
}

if (!code.includes('useEffect(() => {') || !code.includes('initialSelectedWordId')) {
  const effect = `
  React.useEffect(() => {
    if (initialSelectedWordId) {
      setSelectedWordId(initialSelectedWordId);
      setViewState("study");
    }
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSelectedWordId, initialSearchQuery]);
`;
  code = code.replace(
    '  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);',
    '  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);\n' + effect
  );
}

fs.writeFileSync(file, code);
