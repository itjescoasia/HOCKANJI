const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const target = `    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
      onDeleteCard(currentCard.id);
    }`;
const newTarget = `    setConfirmingDeleteId(currentCard.id);`;

content = content.replace(target, newTarget);
fs.writeFileSync('src/components/ReviewSession.tsx', content);
