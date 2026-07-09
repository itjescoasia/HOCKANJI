const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

code = code.replace('import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight } from "../utils/highlight";', 'import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight, HighlightProvider } from "../utils/highlight";');
code = code.replace(/<div className="flex-1 pt-1">/g, '<HighlightProvider><div className="flex-1 pt-1">');
code = code.replace(/<div className="flex flex-col gap-2 opacity-0 group-hover\/ex:opacity-100 transition-all self-start pt-1 shrink-0 z-20">/g, '</HighlightProvider><div className="flex flex-col gap-2 opacity-0 group-hover/ex:opacity-100 transition-all self-start pt-1 shrink-0 z-20">');

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
console.log("Updated IntensiveStudy.tsx");
