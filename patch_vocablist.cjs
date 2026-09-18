const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const searchStr = `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', editCardReq, viewCardReq }: VocabListProps) {`;
const replaceStr = `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', editCardReq, viewCardReq }: VocabListProps) {
  const isAdmin = auth.currentUser?.email === 'nguyenthetrung200126@gmail.com';`;

code = code.replace(searchStr, replaceStr);

// Hide Import button
code = code.replace(/<button\s+onClick=\{\(\) => fileInputRef.current\?.click\(\)\}/, `{isAdmin && <button\n          onClick={() => fileInputRef.current?.click()}`);
code = code.replace(/Nhập Excel\s+<\/button>/, `Nhập Excel\n        </button>}`);

// Hide Edit & Delete buttons
code = code.replace(/<button\s+onClick=\{\(\) => setEditingId\(card\.id\)\}/, `{isAdmin && <button\n                          onClick={() => setEditingId(card.id)}`);
code = code.replace(/title="Sửa"\s+>\s+<Edit2 className="w-4 h-4" \/>\s+<\/button>/, `title="Sửa"\n                        >\n                          <Edit2 className="w-4 h-4" />\n                        </button>}`);

code = code.replace(/<button\s+onClick=\{\(\) => \{\s+if \(window\.confirm/, `{isAdmin && <button\n                        onClick={() => {\n                          if (window.confirm`);
code = code.replace(/title="Xóa thẻ"\s+>\s+<Trash2 className="w-4 h-4" \/>\s+<\/button>/, `title="Xóa thẻ"\n                        >\n                          <Trash2 className="w-4 h-4" />\n                        </button>}`);

fs.writeFileSync('src/components/VocabList.tsx', code);
console.log("Patched VocabList successfully.");
