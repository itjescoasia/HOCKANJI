const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace(/const cleanText = \(str\) => \{\n      if \(!str\) return "";\n      return str\.normalize\("NFD"\)\.replace\(\/\[\\u0300-\\u036f\]\/g, ""\)\.toLowerCase\(\)\.replace\(\/\[\.,!\?;:'"\(\)\[\]\{\}\\\\/_-\]\/g, " "\)\.replace\(\/\\s\+\/g, " "\)\.trim\(\);\n    \};/g, 'const cleanText = (str) => { if (!str) return ""; return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\\s+/g, " ").trim(); };');

fs.writeFileSync('src/components/ConversationView.tsx', content);
