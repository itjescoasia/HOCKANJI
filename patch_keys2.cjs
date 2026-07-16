const fs = require('fs');
let file = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

file = file.replace(/key=\{word\.id\}/g, "key={word.id || Math.random().toString()}");
file = file.replace(/key=\{w\.id\}/g, "key={w.id || Math.random().toString()}");
file = file.replace(/key=\{ex\.id\}/g, "key={ex.id || 'ex-' + index}");

fs.writeFileSync('src/components/IntensiveStudy.tsx', file);
