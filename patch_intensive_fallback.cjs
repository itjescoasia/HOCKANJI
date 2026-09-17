const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const searchStr = `  const selectedWord = deck.find((w) => w.id === selectedWordId);`;

const replaceStr = `  const selectedWord = deck.find((w) => w.id === selectedWordId);

  useEffect(() => {
    if (viewState === "study" && !selectedWord) {
      setViewState("list");
    }
  }, [viewState, selectedWord, setViewState]);`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
  console.log("Patched IntensiveStudy fallback successfully.");
} else {
  console.log("String not found in IntensiveStudy");
}
