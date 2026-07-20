const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
content = content.replace(
`  const [editWordData, setEditWordData] = useState({
    word: word.word,
    reading: word.reading,
    romaji: word.romaji || "",
    category: word.category as WordCategory,
    explanation: word.explanation,
  });`,
`  const [editWordData, setEditWordData] = useState({
    word: word.word || "",
    reading: word.reading || "",
    romaji: word.romaji || "",
    category: word.category as WordCategory,
    explanation: word.explanation || "",
  });`
);
fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
