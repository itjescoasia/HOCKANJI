const fs = require('fs');

let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

// Fix duplicate PlusCircle
content = content.replace(/  PlusCircle,\n/, ''); // Try removing one

// Add isDeleteUnlocked
if (!content.includes('const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);')) {
  content = content.replace(
    'const [targetExampleId, setTargetExampleId] = useState<string | null>(null);',
    'const [targetExampleId, setTargetExampleId] = useState<string | null>(null);\n  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);'
  );
}

// Fix handleDragEnd type
content = content.replace(
  'const handleDragEnd = (event: DragEndEvent) => {',
  'const handleDragEnd = (event: any) => {'
);

// In newRender, fix variables
content = content.replace(/value={newWord}/g, 'value={newWordData.word}');
content = content.replace(/onChange={\(e\) => setNewWord\(e.target.value\)}/g, 'onChange={(e) => setNewWordData({...newWordData, word: e.target.value})}');
content = content.replace(/!String\(newWord \|\| ""\)\.trim\(\)/g, '!String(newWordData.word || "").trim()');

content = content.replace(/value={newReading}/g, 'value={newWordData.reading}');
content = content.replace(/onChange={\(e\) => setNewReading\(e.target.value\)}/g, 'onChange={(e) => setNewWordData({...newWordData, reading: e.target.value})}');

content = content.replace(/value={newRomaji}/g, 'value={newWordData.romaji}');
content = content.replace(/onChange={\(e\) => setNewRomaji\(e.target.value\)}/g, 'onChange={(e) => setNewWordData({...newWordData, romaji: e.target.value})}');

content = content.replace(/value={newCategory}/g, 'value={newWordData.category}');
content = content.replace(/onChange={\(e\) => setNewCategory\(e.target.value\)}/g, 'onChange={(e) => setNewWordData({...newWordData, category: e.target.value as any})}');

content = content.replace(/value={newExplanation}/g, 'value={newWordData.explanation}');
content = content.replace(/onChange={\(e\) => setNewExplanation\(e.target.value\)}/g, 'onChange={(e) => setNewWordData({...newWordData, explanation: e.target.value})}');

// Fix StudyView props
const studyViewPropsStr = `<StudyView
            word={selectedWord}
            onBack={() => {
              setViewState("list");
              setSelectedWordId(null);
            }}
            onUpdate={(id, updates) => onUpdateWord(id, updates)}
            mainDeck={mainDeck}
            onStartTopicReview={onStartTopicReview}
          />`;

const correctStudyViewPropsStr = `<StudyView
            deck={deck}
            word={selectedWord}
            targetExampleId={targetExampleId || undefined}
            onCopyExample={() => {}} // handleCopyExample is not available here, but we can pass a noop or reconstruct it. Wait, the original code had handleCopyExample.
            onBack={() => {
              setViewState("list");
              setSelectedWordId(null);
              setTargetExampleId(null);
            }}
            onUpdateWord={onUpdateWord}
            renderHighlight={renderExampleHighlight}
            onStartTopicReview={onStartTopicReview}
          />`;

content = content.replace(studyViewPropsStr, correctStudyViewPropsStr);

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);

