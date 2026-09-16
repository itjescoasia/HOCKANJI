const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const useEffectToInject = `
  // Đồng bộ Realtime (Thời gian thực) từ Firebase về UI cho thẻ đang xem/sửa
  React.useEffect(() => {
    if (viewingCard) {
      const updatedCard = deck.find(c => c.id === viewingCard.id);
      if (updatedCard) {
         if (JSON.stringify(updatedCard) !== JSON.stringify(viewingCard)) {
            setViewingCard(updatedCard);
         }
      }
    }
  }, [deck]);

  React.useEffect(() => {
    if (editingId) {
       const updatedCard = deck.find(c => c.id === editingId);
       if (updatedCard) {
          setEditForm(prev => {
             let changed = false;
             let newForms = prev.forms ? [...prev.forms] : [];
             let newExamples = prev.examples ? [...prev.examples] : [];
             
             if (updatedCard.forms) {
                updatedCard.forms.forEach((cloudForm, idx) => {
                   if (cloudForm.audioUrl && newForms[idx] && !newForms[idx].audioUrl) {
                      newForms[idx].audioUrl = cloudForm.audioUrl;
                      newForms[idx].hasAudio = true;
                      changed = true;
                   }
                });
             }
             if (updatedCard.examples) {
                updatedCard.examples.forEach((cloudEx, idx) => {
                   if (cloudEx.audioUrl && newExamples[idx] && !newExamples[idx].audioUrl) {
                      newExamples[idx].audioUrl = cloudEx.audioUrl;
                      newExamples[idx].hasAudio = true;
                      changed = true;
                   }
                });
             }
             if (updatedCard.audioUrl && !prev.audioUrl) {
                return { ...prev, audioUrl: updatedCard.audioUrl, forms: newForms, examples: newExamples };
             }
             if (changed) {
                return { ...prev, forms: newForms, examples: newExamples };
             }
             return prev;
          });
       }
    }
  }, [deck]);
`;

code = code.replace(
  /React\.useEffect\(\(\) => \{\n    if \(viewCardReq\?\.id\) \{/,
  useEffectToInject + '\n  React.useEffect(() => {\n    if (viewCardReq?.id) {'
);

fs.writeFileSync('src/components/VocabList.tsx', code);
