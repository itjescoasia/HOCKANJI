const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const searchStr = `export default function ConversationView({
  conversations,
  onAddConversation,
  onRemoveConversation,`;

const replaceStr = `export default function ConversationView({
  conversations,
  onAddConversation,
  onRemoveConversation,`;

// We inject isAdmin at the top of the component
code = code.replace(/const \[viewMode, setViewMode\] = useState<\'list\' \| \'add\' \| \'edit\' \| \'study\'\>\(\'list\'\);/, `const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'study'>('list');
  const isAdmin = auth.currentUser?.email === 'nguyenthetrung200126@gmail.com';`);

// Hide Thêm hội thoại
code = code.replace(/<button\s+onClick=\{\(\) => setViewMode\('add'\)\}/, `{isAdmin && <button\n              onClick={() => setViewMode('add')}`);
code = code.replace(/Thêm hội thoại\s+<\/button>/, `Thêm hội thoại\n            </button>}`);

// Hide Sửa and Xóa
code = code.replace(/<button\s+onClick=\{\(\) => setViewMode\('edit'\)\}/, `{isAdmin && <button\n                    onClick={() => setViewMode('edit')}`);
code = code.replace(/title="Sửa"\s+>\s+<Edit2 className="w-4 h-4" \/>\s+<\/button>/, `title="Sửa"\n                  >\n                    <Edit2 className="w-4 h-4" />\n                  </button>}`);

code = code.replace(/<button\s+onClick=\{handleDelete\}/, `{isAdmin && <button\n                    onClick={handleDelete}`);
code = code.replace(/title="Xóa"\s+>\s+<Trash2 className="w-4 h-4" \/>\s+<\/button>/, `title="Xóa"\n                  >\n                    <Trash2 className="w-4 h-4" />\n                  </button>}`);

fs.writeFileSync('src/components/ConversationView.tsx', code);
console.log("Patched ConversationView successfully.");
