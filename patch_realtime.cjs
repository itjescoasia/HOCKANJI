const fs = require('fs');
const content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const target1 = `import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";`;
const replacement1 = `import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";
import { normalizeSentence } from "../utils/stringUtils";`;

const target2 = `  useEffect(() => {
    if (targetExampleId) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        const el = document.getElementById(\`example-\${targetExampleId}\`);`;

const replacement2 = `  // Real-time duplicate detection for adding
  useEffect(() => {
    if (newSentence.trim()) {
      const existing = word.examples.find(
        (ex) => normalizeSentence(ex.sentence) === normalizeSentence(newSentence)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      setDuplicateWarningId(null);
    }
  }, [newSentence, word.examples]);

  // Real-time duplicate detection for editing
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
  }, [editExampleData?.sentence, editingExampleId, isEditing, word.examples, newSentence]);

  useEffect(() => {
    if (targetExampleId) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        const el = document.getElementById(\`example-\${targetExampleId}\`);`;

const target3 = `    const existingExample = word.examples.find(
      (ex) =>
        ex.id !== editingExampleId &&
        ex.sentence.trim().toLowerCase() ===
          editExampleData.sentence.trim().toLowerCase(),
    );`;
const replacement3 = `    const existingExample = word.examples.find(
      (ex) =>
        ex.id !== editingExampleId &&
        normalizeSentence(ex.sentence) === normalizeSentence(editExampleData.sentence),
    );`;

const target4 = `    const existingExample = word.examples.find(
      (ex) =>
        ex.sentence.trim().toLowerCase() === newSentence.trim().toLowerCase(),
    );`;
const replacement4 = `    const existingExample = word.examples.find(
      (ex) =>
        normalizeSentence(ex.sentence) === normalizeSentence(newSentence),
    );`;

let newContent = content.replace(target1, replacement1).replace(target2, replacement2).replace(target3, replacement3).replace(target4, replacement4);

fs.writeFileSync('src/components/IntensiveStudy.tsx', newContent);
console.log("Success");
