const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(/<button \n                          onClick=\{\(\) => startEdit\(card\)\}\n                          className="p-2 hover:bg-theme-accent\/10 text-theme-primary\/40 hover:text-theme-accent transition-all rounded-xl inline-flex items-center justify-center mr-1"\n                          title="Sửa thẻ"\n                        >\n                          <Edit2 className="w-4 h-4" \/>\n                        <\/button>/g, 
`{isAdmin && <button 
                          onClick={() => startEdit(card)}
                          className="p-2 hover:bg-theme-accent/10 text-theme-primary/40 hover:text-theme-accent transition-all rounded-xl inline-flex items-center justify-center mr-1"
                          title="Sửa thẻ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>}`);

fs.writeFileSync('src/components/VocabList.tsx', code);
console.log("Patched VocabList edit button.");
