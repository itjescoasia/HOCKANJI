const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(file, 'utf8');

// I'll extract everything around the broken part and fix it.
// The broken part:
// const escapedHighlight = highlight.trim().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\function StudyView({

code = code.replace(/const escapedHighlight = highlight\.trim\(\)\.replace\(\/\[\.\*\+\?\^\$\{\}\(\)\|\[\\\]\\\\\]\/g, '(.*?)}\);/, 
\`const escapedHighlight = highlight.trim().replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\\\\\$&');
    const regex = new RegExp(\\\`(\\$\\{escapedHighlight\\})\\\`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.trim().toLowerCase()
        ? <mark key={i} className="bg-theme-accent/20 text-theme-accent font-bold px-0.5 rounded-sm">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };
\`);

fs.writeFileSync(file, code);
