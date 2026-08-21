const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const t0 = `export function getWordTypeBadgeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-sm border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-sm border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800/50";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-sm border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-sm border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50";
  }
  return defaultClasses;
}`;

const r0 = `export function getWordTypeBadgeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded-sm border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded-sm border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold bg-pink-50 text-pink-800 px-1.5 py-0.5 rounded-sm border border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800/50";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-sm border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded-sm border border-amber-400 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold bg-orange-50 text-orange-900 px-1.5 py-0.5 rounded-sm border border-orange-400 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50";
  } else if (type === "Trạng từ" || type === "Trạng từ (副詞)") {
    return "text-[10px] font-bold bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded-sm border border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/50";
  } else if (type === "Ngữ pháp") {
    return "text-[10px] font-bold bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded-sm border border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50";
  }
  return defaultClasses;
}`;
code = code.replace(t0, r0);

fs.writeFileSync('src/components/VocabList.tsx', code);
