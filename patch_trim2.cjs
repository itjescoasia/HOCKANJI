const fs = require('fs');
const files = ['src/components/IntensiveStudy.tsx', 'src/components/ConversationView.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/editExampleData\.sentence\.trim\(\)/g, '(editExampleData.sentence || "").trim()');
  content = content.replace(/editExampleData\.reading\.trim\(\)/g, '(editExampleData.reading || "").trim()');
  content = content.replace(/editExampleData\.romaji\.trim\(\)/g, '(editExampleData.romaji || "").trim()');
  content = content.replace(/editExampleData\.translation\.trim\(\)/g, '(editExampleData.translation || "").trim()');
  content = content.replace(/editExampleData\.specialNote\.trim\(\)/g, '(editExampleData.specialNote || "").trim()');
  
  content = content.replace(/newSentence\.trim\(\)/g, '(newSentence || "").trim()');
  content = content.replace(/newReading\.trim\(\)/g, '(newReading || "").trim()');
  content = content.replace(/newRomaji\.trim\(\)/g, '(newRomaji || "").trim()');
  content = content.replace(/newTranslation\.trim\(\)/g, '(newTranslation || "").trim()');
  content = content.replace(/newSpecialNote\.trim\(\)/g, '(newSpecialNote || "").trim()');
  
  fs.writeFileSync(file, content);
}
console.log('Patched trim errors in IntensiveStudy and ConversationView');
