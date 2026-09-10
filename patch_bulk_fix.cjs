const fs = require('fs');

// 1. Remove dispatchEvent from generateAndUploadTTS
let playTTS = fs.readFileSync('src/utils/playTTS.ts', 'utf8');
playTTS = playTTS.replace(
  `             window.dispatchEvent(new CustomEvent('tts-generated', { 
               detail: { text, audioUrl: downloadUrl } 
             }));
             return downloadUrl;`,
  `             return downloadUrl;`
);
fs.writeFileSync('src/utils/playTTS.ts', playTTS);

// 2. Modify handleBulkGenerateAudio in VocabList.tsx
let vocab = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetLogic = `       // Bulk generate
       for (let i = 0; i < textsToGenerate.length; i++) {
          const text = textsToGenerate[i];
          const url = await generateAndUploadTTS(text);
          if (url) generatedCount++;
          setBulkProgress({ current: i + 1, total: textsToGenerate.length });
       }
       
       alert(\`Đã tự động tạo và tải lên thành công \${generatedCount}/\${textsToGenerate.length} MP3.\`);
    } catch (e) {`;

const newLogic = `       // Bulk generate
       let newForms = viewingCard.forms ? [...viewingCard.forms] : [];
       let newExamples = viewingCard.examples ? [...viewingCard.examples] : [];
       
       for (let i = 0; i < textsToGenerate.length; i++) {
          const text = textsToGenerate[i];
          const url = await generateAndUploadTTS(text);
          if (url) {
             generatedCount++;
             // Update local copies
             newForms = newForms.map(f => f.value === text ? { ...f, audioUrl: url, hasAudio: true } : f);
             newExamples = newExamples.map(ex => ex.sentence === text ? { ...ex, audioUrl: url, hasAudio: true } : ex);
          }
          setBulkProgress({ current: i + 1, total: textsToGenerate.length });
       }
       
       if (generatedCount > 0 && onUpdate) {
          // Send a single update to the database with all arrays correctly populated
          const updates: any = {};
          if (viewingCard.forms && viewingCard.forms.length > 0) updates.forms = newForms;
          if (viewingCard.examples && viewingCard.examples.length > 0) updates.examples = newExamples;
          
          await onUpdate(viewingCard.id, updates);
          
          // Also update the local viewingCard state so UI reflects changes instantly
          setViewingCard(prev => prev ? { ...prev, ...updates } : prev);
       }
       
       alert(\`Đã tự động tạo và tải lên thành công \${generatedCount}/\${textsToGenerate.length} MP3.\`);
    } catch (e) {`;

vocab = vocab.replace(targetLogic, newLogic);
fs.writeFileSync('src/components/VocabList.tsx', vocab);
