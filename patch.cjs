const fs = require('fs');
let code = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');
code = code.replace("const nextIndex =  return (", `const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
  };

  return (`);
fs.writeFileSync('src/components/ShortStudySession.tsx', code);
