const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

content = content.replace(
  /if \(confirm\("Bạn có chắc chắn muốn xóa chủ đề này không\? Toàn bộ các câu hội thoại bên trong sẽ bị mất\."\)\) {\s*onRemoveConversation\(conv\.id\);\s*}/g,
  `setConfirmingDeleteId(conv.id);`
);

fs.writeFileSync('src/components/ConversationView.tsx', content);
