const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const t1 = `  const [isBulkGenerating, setIsBulkGenerating] = useState(false);`;
const r1 = `  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleGenerateSingle = async (text: string | undefined, onComplete: (url: string) => void, id: string) => {
    if (!text) return;
    setGeneratingId(id);
    try {
      const url = await generateAndUploadTTS(text);
      if (url) {
        onComplete(url);
      } else {
        alert("Có lỗi khi tạo âm thanh. Vui lòng kiểm tra API Key.");
      }
    } catch(err) {
      alert("Lỗi khi gọi AI tạo âm thanh");
    }
    setGeneratingId(null);
  };`;

code = code.replace(t1, r1);

fs.writeFileSync('src/components/VocabList.tsx', code);
