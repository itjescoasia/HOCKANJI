const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const searchStr = `export default function IntensiveStudy({
  deck = [],
  mainDeck = [],
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onReorderDeck,
  onStartTopicReview,
  initialSearchQuery = '',
  initialSelectedWordId = null,
}: IntensiveStudyProps) {`;

const replaceStr = `export default function IntensiveStudy({
  deck = [],
  mainDeck = [],
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onReorderDeck,
  onStartTopicReview,
  initialSearchQuery = '',
  initialSelectedWordId = null,
}: IntensiveStudyProps) {
  const isAdmin = auth.currentUser?.email === 'nguyenthetrung200126@gmail.com';`;

code = code.replace(searchStr, replaceStr);

// Hide buttons
code = code.replace(/<button\s+onClick=\{\(\) => \{\s+setNewWordCategory/, `{isAdmin && <button\n                onClick={() => {\n                  setNewWordCategory`);
code = code.replace(/Thêm chuyên đề mới\s+<\/button>/, `Thêm chuyên đề mới\n              </button>}`);

code = code.replace(/<button\s+onClick=\{\(\) => setViewMode\('add'\)\}/, `{isAdmin && <button\n              onClick={() => setViewMode('add')}`);
code = code.replace(/<span>Thêm mới<\/span>\s+<\/button>/, `<span>Thêm mới</span>\n            </button>}`);

code = code.replace(/<button\s+onClick=\{\(\) => setViewMode\('edit'\)\}/, `{isAdmin && <button\n                    onClick={() => setViewMode('edit')}`);
code = code.replace(/title="Sửa"\s+>\s+<Edit2 className="w-4 h-4" \/>\s+<\/button>/, `title="Sửa"\n                  >\n                    <Edit2 className="w-4 h-4" />\n                  </button>}`);

code = code.replace(/<button\s+onClick=\{handleDelete\}/, `{isAdmin && <button\n                    onClick={handleDelete}`);
code = code.replace(/title="Xóa"\s+>\s+<Trash2 className="w-4 h-4" \/>\s+<\/button>/, `title="Xóa"\n                  >\n                    <Trash2 className="w-4 h-4" />\n                  </button>}`);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
console.log("Patched IntensiveStudy successfully.");
