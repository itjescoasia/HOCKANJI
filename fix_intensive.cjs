const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

code = code.replace(/\{\!isAddingExample && \(\n              \{isAdmin && <button/g, "{!isAddingExample && isAdmin && (<button");
code = code.replace(/<span>Thêm mới<\/span>\n            <\/button>\}\n            \)\}/g, "<span>Thêm mới</span>\n            </button>\n            )}");

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
console.log("Patched IntensiveStudy syntax.");
