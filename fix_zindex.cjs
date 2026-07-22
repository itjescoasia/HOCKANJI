const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

code = code.replace(
  /<span className="relative inline-block" ref={containerRef} onMouseEnter=\{\(\) => card && setHoveredCard/g,
  '<span className={`relative inline-block ${isOpen ? "z-50" : "z-0"}`} ref={containerRef} onMouseEnter={() => card && setHoveredCard'
);

fs.writeFileSync('src/utils/highlight.tsx', code);
