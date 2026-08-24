const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const target = `<span className="text-2xl sm:text-4xl font-serif text-theme-primary text-center break-words mb-2">
                {word.word}
              </span>`;
const replacement = `<span className={\`font-serif text-theme-primary text-center break-words mb-2 \${word.word.length > 20 ? 'text-lg sm:text-xl' : word.word.length > 10 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'}\`}>
                {word.word}
              </span>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
