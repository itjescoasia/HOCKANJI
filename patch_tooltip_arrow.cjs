const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const targetArrow = `              {/* Arrow */}
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-theme-panel border-t border-l border-theme-subtle rotate-45 rounded-sm" />`;

const newArrow = `              {/* Arrow */}
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-theme-panel border-t border-l border-theme-subtle rotate-45 rounded-[2px]" />`;

content = content.replace(targetArrow, newArrow);
fs.writeFileSync('src/utils/highlight.tsx', content);
console.log("Patched tooltip arrow");
