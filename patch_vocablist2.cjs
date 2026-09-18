const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(/<Upload className="w-3 h-3" \/> \{isImporting \? 'Đang Import\.\.\.' : 'Nhập Excel'\}\n            <\/button>/g, `<Upload className="w-3 h-3" /> {isImporting ? 'Đang Import...' : 'Nhập Excel'}\n            </button>}`);

code = code.replace(/<button\s+onClick=\{\(\) => setEditingId\(card\.id\)\}/g, `{isAdmin && <button\n                          onClick={() => setEditingId(card.id)}`);
code = code.replace(/title="Sửa"\s+>\s+<Edit2 className="w-4 h-4" \/>\s+<\/button>/g, `title="Sửa"\n                        >\n                          <Edit2 className="w-4 h-4" />\n                        </button>}`);

fs.writeFileSync('src/components/VocabList.tsx', code);
console.log("Patched VocabList again.");
