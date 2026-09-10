const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const target = `       if (generatedCount > 0 && onUpdate) {
          // Send a single update to the database with all arrays correctly populated
          const updates: any = {};
          if (viewingCard.forms && viewingCard.forms.length > 0) updates.forms = newForms;
          if (viewingCard.examples && viewingCard.examples.length > 0) updates.examples = newExamples;
          
          await onUpdate(viewingCard.id, updates);`;

const replacement = `       if (generatedCount > 0 && onUpdate) {
          // Send a single update to the database with all arrays correctly populated
          const updates: any = {};
          if (viewingCard.forms && viewingCard.forms.length > 0) updates.forms = newForms;
          if (viewingCard.examples && viewingCard.examples.length > 0) updates.examples = newExamples;
          
          console.log("BULK UPLOAD COMPLETED. Sending updates:", updates);
          await onUpdate(viewingCard.id, updates);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/VocabList.tsx', code);
