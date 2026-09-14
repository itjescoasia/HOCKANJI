const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

if (!code.includes('Music,')) {
    code = code.replace('import { Play,', 'import { Play, Music,');
    fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
}
