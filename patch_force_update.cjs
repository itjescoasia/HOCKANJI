const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetLogic = `       if (generatedCount > 0 && onUpdate) {
          // Send a single update to the database with all arrays correctly populated
          const updates: any = {};
          if (viewingCard.forms && viewingCard.forms.length > 0) updates.forms = newForms;
          if (viewingCard.examples && viewingCard.examples.length > 0) updates.examples = newExamples;
          
          console.log("BULK UPLOAD COMPLETED. Sending updates:", updates);
          await onUpdate(viewingCard.id, updates);
          
          // Also update the local viewingCard state so UI reflects changes instantly
          setViewingCard(prev => prev ? { ...prev, ...updates } : prev);
       }`;

const newLogic = `       if (generatedCount > 0 && onUpdate) {
          // Send a single update to the database with all arrays correctly populated
          const updates: any = {};
          if (viewingCard.forms && viewingCard.forms.length > 0) updates.forms = newForms;
          if (viewingCard.examples && viewingCard.examples.length > 0) updates.examples = newExamples;
          
          console.log("BULK UPLOAD COMPLETED. Sending updates:", updates);
          
          // Bỏ qua onUpdate thông thường để force ghi trực tiếp lên Firebase cho chắc chắn
          try {
             const { doc, setDoc } = require('firebase/firestore');
             const { db, auth } = require('../lib/firebase');
             if (auth.currentUser) {
                const cardRef = doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', viewingCard.id);
                
                // Loại bỏ undefined
                const cleanArray = (arr) => {
                   if (!arr) return arr;
                   return arr.map(item => {
                      const cleanItem = {};
                      for (const key in item) {
                         if (item[key] !== undefined) cleanItem[key] = item[key];
                      }
                      return cleanItem;
                   });
                };
                
                const finalUpdates = {};
                if (updates.forms) finalUpdates.forms = cleanArray(updates.forms);
                if (updates.examples) finalUpdates.examples = cleanArray(updates.examples);
                
                await setDoc(cardRef, finalUpdates, { merge: true });
                console.log("Forced Firebase update success!");
             }
          } catch (forceErr) {
             console.error("Force update err:", forceErr);
             await onUpdate(viewingCard.id, updates);
          }
          
          // Also update the local viewingCard state so UI reflects changes instantly
          setViewingCard(prev => prev ? { ...prev, ...updates } : prev);
       }`;

code = code.replace(targetLogic, newLogic);
fs.writeFileSync('src/components/VocabList.tsx', code);
