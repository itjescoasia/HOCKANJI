const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// 1. Add state and update handleBulkGenerateAudio
const targetLogic = `  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

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
  };`;

const replacementLogic = `  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{current: number, total: number} | null>(null);

  const handleBulkGenerateAudio = async () => {
    if (!viewingCard) return;
    setIsBulkGenerating(true);
    setBulkProgress(null);
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
       
       setBulkProgress({ current: 0, total: textsToGenerate.length });
       
       // Bulk generate
       for (let i = 0; i < textsToGenerate.length; i++) {
          const text = textsToGenerate[i];
          const url = await generateAndUploadTTS(text);
          if (url) generatedCount++;
          setBulkProgress({ current: i + 1, total: textsToGenerate.length });
       }
       
       alert(\`Đã tự động tạo và tải lên thành công \${generatedCount}/\${textsToGenerate.length} MP3.\`);
    } catch (e) {
       console.error("Bulk generate error:", e);
       alert("Có lỗi xảy ra khi tạo MP3 hàng loạt.");
    } finally {
       setIsBulkGenerating(false);
       setTimeout(() => setBulkProgress(null), 1000);
    }
  };`;

code = code.replace(targetLogic, replacementLogic);


// 2. Update UI
const targetUI = `                  {((viewingCard.forms && viewingCard.forms.length > 0) || (viewingCard.examples && viewingCard.examples.length > 0)) && (
                     <button 
                       onClick={handleBulkGenerateAudio}
                       disabled={isBulkGenerating}
                       className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-theme-accent bg-theme-accent/10 border border-theme-accent/20 hover:bg-theme-accent/20 rounded-md transition-colors disabled:opacity-50"
                       title="Tự động tạo và tải lên Cloud MP3 cho tất cả các Thể và Ví dụ chưa có âm thanh"
                     >
                       {isBulkGenerating ? (
                         <span className="flex items-center gap-1">
                           <div className="w-3 h-3 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                           Đang xử lý...
                         </span>
                       ) : (
                         <span className="flex items-center gap-1">
                           <Volume2 className="w-3.5 h-3.5" />
                           Tải MP3 hàng loạt
                         </span>
                       )}
                     </button>
                  )}`;

const replacementUI = `                  {((viewingCard.forms && viewingCard.forms.length > 0) || (viewingCard.examples && viewingCard.examples.length > 0)) && (
                     <div className="flex flex-col gap-1.5 items-end">
                       <button 
                         onClick={handleBulkGenerateAudio}
                         disabled={isBulkGenerating}
                         className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-theme-accent bg-theme-accent/10 border border-theme-accent/20 hover:bg-theme-accent/20 rounded-md transition-colors disabled:opacity-50 min-w-[140px] justify-center"
                         title="Tự động tạo và tải lên Cloud MP3 cho tất cả các Thể và Ví dụ chưa có âm thanh"
                       >
                         {isBulkGenerating ? (
                           <span className="flex items-center gap-1.5">
                             <div className="w-3 h-3 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                             {bulkProgress ? \`\${bulkProgress.current}/\${bulkProgress.total}\` : 'Đang xử lý...'}
                           </span>
                         ) : (
                           <span className="flex items-center gap-1">
                             <Volume2 className="w-3.5 h-3.5" />
                             Tải MP3 hàng loạt
                           </span>
                         )}
                       </button>
                       {isBulkGenerating && bulkProgress && (
                         <div className="w-full bg-theme-accent/10 rounded-full h-1 overflow-hidden relative">
                            <div 
                              className="bg-theme-accent h-1 transition-all duration-300 absolute left-0 top-0 bottom-0" 
                              style={{ width: \`\${(bulkProgress.current / bulkProgress.total) * 100}%\` }}
                            ></div>
                         </div>
                       )}
                     </div>
                  )}`;

code = code.replace(targetUI, replacementUI);

fs.writeFileSync('src/components/VocabList.tsx', code);
