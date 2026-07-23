const fs = require('fs');

let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');
code = code.replace(
  /<div className="sticky bottom-8 z-10 w-full mt-4 flex justify-center pointer-events-none">/g,
  '<div className="sticky bottom-8 z-[60] w-full mt-4 flex justify-center pointer-events-none">'
);
fs.writeFileSync('src/components/ConversationView.tsx', code);

let intn = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
intn = intn.replace(
  /<div className="sticky bottom-8 z-10 w-full mt-4 flex justify-center pointer-events-none">/g,
  '<div className="sticky bottom-8 z-[60] w-full mt-4 flex justify-center pointer-events-none">'
);
fs.writeFileSync('src/components/IntensiveStudy.tsx', intn);
