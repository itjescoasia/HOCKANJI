const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
code = code.replace(/\{word\.explanation && \(/g, '{ (word.explanation || word.category) && (');
code = code.replace(/cleanMarkdownForDisplay\(word\.explanation\)/g, 'cleanMarkdownForDisplay(word.explanation || "")');
fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
