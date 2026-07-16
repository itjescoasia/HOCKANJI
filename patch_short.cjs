const fs = require('fs');
let file = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');

file = file.replace(
`interface ShortStudyCardProps {
  currentWord: KanjiCard;`,
`interface ShortStudyCardProps {
  key?: React.Key;
  currentWord: KanjiCard;`);

fs.writeFileSync('src/components/ShortStudySession.tsx', file);
