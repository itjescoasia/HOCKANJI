const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace('import { renderExampleHighlight, RelatedHighlight } from "../utils/highlight";', 'import { renderExampleHighlight, RelatedHighlight, HighlightProvider } from "../utils/highlight";');
code = code.replace(/<p className="text-xl sm:text-2xl text-theme-primary leading-relaxed font-serif">/, '<HighlightProvider><p className="text-xl sm:text-2xl text-theme-primary leading-relaxed font-serif">');
code = code.replace(/\{sentenceOfTheDay\.example\.translation\}\r?\n\s*<\/p>/, '{sentenceOfTheDay.example.translation}\n                </p></HighlightProvider>');

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Updated Dashboard.tsx");
