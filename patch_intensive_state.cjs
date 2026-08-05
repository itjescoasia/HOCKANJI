const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

content = content.replace(
  '  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);',
  '  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);\n  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);'
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
