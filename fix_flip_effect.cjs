const fs = require('fs');

function fixFile(file, isFlippedVar) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove the opacity toggle from Front
  const frontRegex = new RegExp(`\\\$\\{${isFlippedVar} \\? 'opacity-0 pointer-events-none' : 'opacity-100'\\}`, 'g');
  code = code.replace(frontRegex, '');

  // Remove the opacity toggle from Back
  const backRegex = new RegExp(`\\\$\\{\\!${isFlippedVar} \\? 'opacity-0 pointer-events-none' : 'opacity-100'\\}`, 'g');
  code = code.replace(backRegex, '');

  fs.writeFileSync(file, code);
}

fixFile('src/components/SentenceReview.tsx', 'showAnswer');
fixFile('src/components/ReviewSession.tsx', 'showAnswer');
fixFile('src/components/ShortStudySession.tsx', 'isMeaningShown');
