const fs = require('fs');

function cleanMarkdown(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('cleanMarkdownForDisplay')) return;

  const helper = `
function cleanMarkdownForDisplay(text: string) {
  if (!text) return text;
  // Remove markdown headers like ###, **, *
  return text.replace(/^#{1,6}\\s*/gm, '').replace(/\\*\\*/g, '').replace(/\\*/g, '');
}
`;

  if (file === 'src/components/VocabList.tsx') {
    content = content.replace('export default function VocabList', helper + '\nexport default function VocabList');
    content = content.replace('<Markdown>{card.kanjiExplanation}</Markdown>', '<Markdown>{cleanMarkdownForDisplay(card.kanjiExplanation)}</Markdown>');
  } else if (file === 'src/components/IntensiveStudy.tsx') {
    content = content.replace('export default function IntensiveStudy', helper + '\nexport default function IntensiveStudy');
    content = content.replace('<Markdown>{word.explanation}</Markdown>', '<Markdown>{cleanMarkdownForDisplay(word.explanation)}</Markdown>');
  }

  fs.writeFileSync(file, content);
}

cleanMarkdown('src/components/VocabList.tsx');
cleanMarkdown('src/components/IntensiveStudy.tsx');
console.log('Patched display');
