const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'list', label: 'Danh sách', icon: BookMarked },
    { id: 'intensive_vocab', label: 'Chuyên đề', icon: Lightbulb },
    { id: 'conversation', label: 'Hội thoại', icon: MessageSquare },
    { id: 'add', label: 'Thêm thẻ', icon: PlusCircle },
  ] as const;`;

const replaceStr = `  const isAdmin = user?.email === 'nguyenthetrung200126@gmail.com';
  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'list', label: 'Danh sách', icon: BookMarked },
    { id: 'intensive_vocab', label: 'Chuyên đề', icon: Lightbulb },
    { id: 'conversation', label: 'Hội thoại', icon: MessageSquare },
    ...(isAdmin ? [{ id: 'add', label: 'Thêm thẻ', icon: PlusCircle }] : []),
  ];`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched navItems successfully.");
} else {
  console.log("String not found in App.tsx");
}
