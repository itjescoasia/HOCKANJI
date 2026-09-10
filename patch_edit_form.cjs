const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetLogic = `          // Also update the local viewingCard state so UI reflects changes instantly
          setViewingCard(prev => prev ? { ...prev, ...updates } : prev);
       }`;

const newLogic = `          // Also update the local viewingCard state so UI reflects changes instantly
          setViewingCard(prev => prev ? { ...prev, ...updates } : prev);
          
          // CRITICAL: If the user has the Edit Form open for this same card, inject the audio URLs 
          // into the editForm state so they don't get erased if the user clicks "Lưu" (Save).
          if (editingId === viewingCard.id) {
             setEditForm(prev => {
                const updatedForms = prev.forms ? [...prev.forms] : [];
                if (updates.forms) {
                   updates.forms.forEach((newF, idx) => {
                      if (updatedForms[idx]) {
                         updatedForms[idx].audioUrl = newF.audioUrl;
                         updatedForms[idx].hasAudio = newF.hasAudio;
                      }
                   });
                }
                const updatedExamples = prev.examples ? [...prev.examples] : [];
                if (updates.examples) {
                   updates.examples.forEach((newEx, idx) => {
                      if (updatedExamples[idx]) {
                         updatedExamples[idx].audioUrl = newEx.audioUrl;
                         updatedExamples[idx].hasAudio = newEx.hasAudio;
                      }
                   });
                }
                return { ...prev, forms: updatedForms, examples: updatedExamples };
             });
          }
       }`;

code = code.replace(targetLogic, newLogic);
fs.writeFileSync('src/components/VocabList.tsx', code);
