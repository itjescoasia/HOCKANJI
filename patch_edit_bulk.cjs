const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetInsert = `  const [editForm, setEditForm] = useState<Partial<Pick<KanjiCard`;

const newFunc = `  const handleEditBulkGenerateAudio = async () => {
    if (!editForm) return;
    setIsBulkGenerating(true);
    setBulkProgress(null);
    let generatedCount = 0;
    try {
       const textsToGenerate = [];
       if (editForm.forms) {
          editForm.forms.forEach(f => {
             if (f.value && !f.audioUrl) textsToGenerate.push(f.value);
          });
       }
       if (editForm.examples) {
          editForm.examples.forEach(ex => {
             if (ex.sentence && !ex.audioUrl) textsToGenerate.push(ex.sentence);
          });
       }
       
       if (textsToGenerate.length === 0) {
          setIsBulkGenerating(false);
          return;
       }
       
       setBulkProgress({ current: 0, total: textsToGenerate.length });
       
       let newForms = editForm.forms ? [...editForm.forms] : [];
       let newExamples = editForm.examples ? [...editForm.examples] : [];
       
       for (let i = 0; i < textsToGenerate.length; i++) {
          const text = textsToGenerate[i];
          const url = await generateAndUploadTTS(text);
          if (url) {
             generatedCount++;
             newForms = newForms.map(f => f.value === text ? { ...f, audioUrl: url, hasAudio: true } : f);
             newExamples = newExamples.map(ex => ex.sentence === text ? { ...ex, audioUrl: url, hasAudio: true } : ex);
          }
          setBulkProgress({ current: i + 1, total: textsToGenerate.length });
       }
       
       if (generatedCount > 0) {
          setEditForm(prev => ({ ...prev, forms: newForms, examples: newExamples }));
       }
       
       alert(\`Đã tạo thành công \${generatedCount}/\${textsToGenerate.length} MP3. Vui lòng nhấn "Lưu" để lưu lại vào Database.\`);
    } catch (e) {
       console.error("Bulk generate error:", e);
       alert("Có lỗi xảy ra khi tạo MP3 hàng loạt.");
    } finally {
       setIsBulkGenerating(false);
       setTimeout(() => setBulkProgress(null), 1000);
    }
  };

`;

code = code.replace(targetInsert, newFunc + targetInsert);
fs.writeFileSync('src/components/VocabList.tsx', code);
