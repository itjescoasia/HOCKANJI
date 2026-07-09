const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  '<HighlightProvider>\n                <div className="flex items-start gap-2 mt-4">',
  '<HighlightProvider><>\n                <div className="flex items-start gap-2 mt-4">'
);
code = code.replace(
  '                </p></HighlightProvider>',
  '                </p></></HighlightProvider>'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
