const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// Replace context back to normal (or just leave onEditCard optional, and trigger both)
content = content.replace(
  `onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEditCard(card); }}`,
  `onClick={(e) => { e.stopPropagation(); setIsOpen(false); if (onEditCard) onEditCard(card); window.dispatchEvent(new CustomEvent('editCard', { detail: card })); }}`
);

fs.writeFileSync('src/utils/highlight.tsx', content);
