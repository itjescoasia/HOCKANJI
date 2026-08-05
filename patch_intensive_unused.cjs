const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
content = content.replace(
  `          if (
            true
          ) {
            setConfirmingDeleteId(word.id);
          }`,
  `          if (
            window.confirm("Bạn có chắc chắn muốn xóa chuyên đề này?")
          ) {
            onRemoveWord(word.id);
          }`
);
fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
