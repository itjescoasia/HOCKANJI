const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Replace logic
code = code.replace(
  /\/\/ Calculate Word of the Day[\s\S]*?const handleSelectNewWotd = \([^)]*\) => {[\s\S]*?};\n/g,
  `// Calculate Sentence of the Day
  const todayForSeed = getVietnamDate();
  const seed =
    todayForSeed.getFullYear() * 10000 +
    (todayForSeed.getMonth() + 1) * 100 +
    todayForSeed.getDate();

  const sentenceOfTheDay = useMemo(() => {
    let allExamples: { word: IntensiveWord, example: IntensiveExample }[] = [];
    intensiveDeck.forEach(word => {
      word.examples.forEach(ex => {
        allExamples.push({ word, example: ex });
      });
    });

    if (allExamples.length === 0) return null;

    const syncedWotdId = stats[todayStr]?.wotdId;
    if (syncedWotdId) {
      const cached = allExamples.find((c) => c.example.id === syncedWotdId);
      if (cached) {
        return cached;
      }
    }

    const unmastered = allExamples.filter(item => item.example.viToJaMastered === false);
    
    let selectedList = unmastered.length > 0 ? unmastered : allExamples;
    
    return selectedList[seed % selectedList.length];
  }, [intensiveDeck, seed, stats, todayStr]);

  // Sync back to stats if WOTD changes and we have a function
  useEffect(() => {
    if (sentenceOfTheDay && onRecordWordOfTheDay && !stats[todayStr]?.wotdId) {
      onRecordWordOfTheDay(sentenceOfTheDay.example.id);
    }
  }, [sentenceOfTheDay, onRecordWordOfTheDay, stats, todayStr]);

  const handleSelectNewWotd = (id: string) => {
    if (onRecordWordOfTheDay) {
      onRecordWordOfTheDay(id);
    }
    setIsChangingWotd(false);
  };\n`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Done replacement');
