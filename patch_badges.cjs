const fs = require('fs');

function patchFile(file, functionName, isVocabList) {
  let code = fs.readFileSync(file, 'utf8');

  const vocabMatch = code.match(new RegExp(`export function ${functionName}\\(.*?\\) \\{[\\s\\S]*?return defaultClasses;\\n\\}`));
  
  if (vocabMatch) {
    const replacement = `export function ${functionName}(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold bg-blue-100 text-blue-700 ${isVocabList ? 'px-1.5 py-0.5' : 'px-2 py-1 uppercase tracking-wider whitespace-nowrap'} rounded-sm border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold bg-purple-100 text-purple-700 ${isVocabList ? 'px-1.5 py-0.5' : 'px-2 py-1 uppercase tracking-wider whitespace-nowrap'} rounded-sm border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold bg-pink-100 text-pink-700 ${isVocabList ? 'px-1.5 py-0.5' : 'px-2 py-1 uppercase tracking-wider whitespace-nowrap'} rounded-sm border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800/50";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold bg-emerald-100 text-emerald-700 ${isVocabList ? 'px-1.5 py-0.5' : 'px-2 py-1 uppercase tracking-wider whitespace-nowrap'} rounded-sm border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold bg-amber-100 text-amber-700 ${isVocabList ? 'px-1.5 py-0.5' : 'px-2 py-1 uppercase tracking-wider whitespace-nowrap'} rounded-sm border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold bg-orange-100 text-orange-700 ${isVocabList ? 'px-1.5 py-0.5' : 'px-2 py-1 uppercase tracking-wider whitespace-nowrap'} rounded-sm border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50";
  }
  return defaultClasses;
}`;
    
    code = code.replace(vocabMatch[0], replacement);
    fs.writeFileSync(file, code);
    console.log(`Patched ${file} successfully`);
  } else {
    console.log(`Could not find function ${functionName} in ${file}`);
  }
}

patchFile('src/components/VocabList.tsx', 'getWordTypeBadgeStyle', true);
patchFile('src/components/IntensiveStudy.tsx', 'getCategoryBadgeStyle', false);
