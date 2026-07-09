const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace('<HighlightProvider><main className="flex-1 flex flex-col">', '<main className="flex-1 flex flex-col">');
code = code.replace('</main></HighlightProvider>', '</main>');
code = code.replace('import { HighlightProvider } from "./utils/highlight";\n', '');
fs.writeFileSync('src/App.tsx', code);
