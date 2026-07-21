const fs = require('fs');
let code = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');
code = code.replace(/\{ \(currentWord\.kanjiExplanation.*?\(\n/g, '{ (currentWord.kanjiExplanation || currentWord.wordType) && (\n');
code = code.replace(/\+ currentWord\.kanjiExplanation\}/g, '+ (currentWord.kanjiExplanation || "")}');
fs.writeFileSync('src/components/ShortStudySession.tsx', code);
