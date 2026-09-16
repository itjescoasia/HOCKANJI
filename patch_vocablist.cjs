const fs = require('fs');

let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');
code = code.replace(
  /onClick=\{\(\) => onRemove\(card\.id\)\}/,
  `onClick={() => { if (window.confirm("Bạn có chắc chắn muốn xóa thẻ này?")) onRemove(card.id); }}`
);
fs.writeFileSync('src/components/VocabList.tsx', code);
