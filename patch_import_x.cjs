const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('import { X ')) {
  if (!code.includes(' X,')) {
    code = code.replace('import { BookMarked, Home,', 'import { BookMarked, Home, X,');
    fs.writeFileSync('src/App.tsx', code);
  }
}
