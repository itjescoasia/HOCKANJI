const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const stateMatch = 'const [view, setView] = useState<any>(() => {';
if (!code.includes('const [isAddModalOpen')) {
  code = code.replace(stateMatch, 'const [isAddModalOpen, setIsAddModalOpen] = useState(false);\n  ' + stateMatch);
  fs.writeFileSync('src/App.tsx', code);
}
