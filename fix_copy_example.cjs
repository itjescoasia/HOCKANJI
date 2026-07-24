const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const copyExampleLogic = `
  const handleCopyExample = (example: IntensiveExample, targetWordId: string) => {
    const targetWord = deck.find(w => w.id === targetWordId);
    if (!targetWord) return;
    onUpdateWord(targetWordId, {
      examples: [...targetWord.examples, { ...example, id: crypto.randomUUID() }]
    });
  };

  return (
`;

content = content.replace(/  return \(\n    <AnimatePresence mode="wait">/, copyExampleLogic + '    <AnimatePresence mode="wait">');

content = content.replace(/onCopyExample=\{\(\) => \{\}\} \/\/ handleCopyExample is not available here, but we can pass a noop or reconstruct it. Wait, the original code had handleCopyExample./, 'onCopyExample={handleCopyExample}');

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
