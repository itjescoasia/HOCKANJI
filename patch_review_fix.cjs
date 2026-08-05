const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

content = content.replace(
  /onDeleteCard\(confirmingDeleteId\);/g,
  `if (confirmingDeleteId) onRemoveCard(confirmingDeleteId);`
);
content = content.replace(
  /onDeleteCard\(currentCard\.id\);/g,
  `onRemoveCard(currentCard.id);`
);

fs.writeFileSync('src/components/ReviewSession.tsx', content);
