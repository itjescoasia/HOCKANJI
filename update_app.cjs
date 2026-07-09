const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('HighlightProvider')) {
  code = code.replace(
    'import { renderExampleHighlight } from "./utils/highlight";',
    'import { renderExampleHighlight, HighlightProvider } from "./utils/highlight";'
  );
  if (!code.includes('HighlightProvider')) {
    // If renderExampleHighlight was not imported in App.tsx
    code = code.replace(
      'import { Dashboard, Study, AddWord, VocabList, FreeStudy, IntensiveStudy, ConversationView } from "./components";',
      'import { Dashboard, Study, AddWord, VocabList, FreeStudy, IntensiveStudy, ConversationView } from "./components";\nimport { HighlightProvider } from "./utils/highlight";'
    );
  }

  code = code.replace(
    '<main className="flex-1 flex flex-col">',
    '<HighlightProvider><main className="flex-1 flex flex-col">'
  );
  
  const closingMain = '</main>';
  const lastIndex = code.lastIndexOf(closingMain);
  code = code.slice(0, lastIndex) + '</main></HighlightProvider>' + code.slice(lastIndex + closingMain.length);
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx updated');
}
