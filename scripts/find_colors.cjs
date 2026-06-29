const fs = require('fs');
const path = require('path');

function findColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findColors(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/(bg|text|border|fill|stroke)-\[#([a-f0-9A-F]{6})\]/g);
      if (matches) {
        matches.forEach(m => console.log(m));
      }
    }
  }
}
findColors('./src');
