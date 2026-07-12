const fs = require('fs');
const content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const targetEffect1 = `  // Real-time duplicate detection for editing
  useEffect(() => {
    if (isEditing && editExampleData && editExampleData.sentence.trim()) {
      const existing = word.examples.find(
        (ex) => ex.id !== editingExampleId && normalizeSentence(ex.sentence) === normalizeSentence(editExampleData.sentence)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      if (!newSentence.trim()) {
        setDuplicateWarningId(null);
      }
    }
  }, [editExampleData?.sentence, editingExampleId, isEditing, word.examples, newSentence]);`;

const targetInsert = `  const [editExampleData, setEditExampleData] = useState({
    sentence: "",
    reading: "",
    romaji: "",
    translation: "",
    specialNote: "",
  });`;

const targetReplacement = `  const [editExampleData, setEditExampleData] = useState({
    sentence: "",
    reading: "",
    romaji: "",
    translation: "",
    specialNote: "",
  });

  // Real-time duplicate detection for editing
  useEffect(() => {
    if (editingExampleId && editExampleData && editExampleData.sentence.trim()) {
      const existing = word.examples.find(
        (ex) => ex.id !== editingExampleId && normalizeSentence(ex.sentence) === normalizeSentence(editExampleData.sentence)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      if (!newSentence.trim()) {
        setDuplicateWarningId(null);
      }
    }
  }, [editExampleData?.sentence, editingExampleId, word.examples, newSentence]);`;

let newContent = content.replace(targetEffect1, "");
newContent = newContent.replace(targetInsert, targetReplacement);
fs.writeFileSync('src/components/IntensiveStudy.tsx', newContent);
console.log("Success");
