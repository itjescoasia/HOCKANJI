const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const insertCode = `
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const handleBulkGenerateAudio = async () => {
    if (!viewingCard) return;
    setIsBulkGenerating(true);
    let generatedCount = 0;
    try {
       const textsToGenerate: string[] = [];
       if (viewingCard.forms) {
          viewingCard.forms.forEach(f => {
             if (f.value && !f.audioUrl) textsToGenerate.push(f.value);
          });
       }
       if (viewingCard.examples) {
          viewingCard.examples.forEach(ex => {
             if (ex.sentence && !ex.audioUrl) textsToGenerate.push(ex.sentence);
          });
       }
       
       if (textsToGenerate.length === 0) {
          alert("Tất cả các thể và câu ví dụ đều đã có MP3!");
          setIsBulkGenerating(false);
          return;
       }
       
       // Bulk generate
       for (const text of textsToGenerate) {
          const url = await generateAndUploadTTS(text);
          if (url) generatedCount++;
       }
       
       alert(\`Đã tự động tạo và tải lên thành công \${generatedCount}/\${textsToGenerate.length} MP3.\`);
    } catch (e) {
       console.error("Bulk generate error:", e);
       alert("Có lỗi xảy ra khi tạo MP3 hàng loạt.");
    } finally {
       setIsBulkGenerating(false);
    }
  };
`;

code = code.replace(
  "const [viewingCard, setViewingCard] = useState<KanjiCard | null>(null);",
  "const [viewingCard, setViewingCard] = useState<KanjiCard | null>(null);\n" + insertCode
);

fs.writeFileSync('src/components/VocabList.tsx', code);
