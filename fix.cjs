const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf-8');
code = code.replace(/handleStartEditE\s*<\/button>/, 'handleStartEditExample(ex)}\n                     className="p-2 text-[#d4d4d4]/40 hover:text-[#c5a059] rounded hover:bg-[#121212]"\n                     title="Chỉnh sửa ví dụ"\n                   >\n                     <Edit2 className="w-4 h-4" />\n                   </button>');
fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
console.log('Fixed');
