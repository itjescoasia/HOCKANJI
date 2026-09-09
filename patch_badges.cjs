const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  /export function getWordTypeBadgeStyle[\s\S]*?return defaultClasses;\n}/,
  `export function getWordTypeBadgeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  const base = "text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ";
  if (type === "Động từ nhóm I") {
    return base + "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
  } else if (type === "Động từ nhóm II") {
    return base + "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300";
  } else if (type === "Động từ nhóm III") {
    return base + "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300";
  } else if (type === "Danh từ") {
    return base + "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return base + "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return base + "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";
  } else if (type === "Trạng từ" || type === "Trạng từ (副詞)") {
    return base + "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300";
  } else if (type === "Ngữ pháp") {
    return base + "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300";
  }
  return base + "bg-theme-base-alt text-theme-primary opacity-80 border border-theme-subtle";
}`
);

fs.writeFileSync('src/components/VocabList.tsx', code);
