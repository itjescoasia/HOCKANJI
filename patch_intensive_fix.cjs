const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

content = content.replace(
  `                  if (viewState === "study") {
                     setViewState("list");
                     setSelectedWordId(null);
                  }`,
  ``
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
