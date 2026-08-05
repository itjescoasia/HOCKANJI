const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

content = content.replace(
  /if \(window\.confirm\('Bạn có chắc chắn muốn xóa từ vựng này không\?'\)\) {\s*onDeleteCard\(currentCard\.id\);\s*}/g,
  `setConfirmingDeleteId(currentCard.id);`
);

fs.writeFileSync('src/components/ReviewSession.tsx', content);
