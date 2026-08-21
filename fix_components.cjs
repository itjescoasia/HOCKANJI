const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (file.includes('VocabList.tsx')) {
    const t0 = `export function getWordTypeBadgeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  } else if (type === "Trạng từ" || type === "Trạng từ (副詞)") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  } else if (type === "Ngữ pháp") {
    return "text-[10px] font-bold   px-1.5 py-0.5 rounded-sm border    ";
  }
  return defaultClasses;
}`;
    const r0 = `export function getWordTypeBadgeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border-[var(--badge-blue-border)]";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border-[var(--badge-purple-border)]";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] border-[var(--badge-pink-border)]";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border-[var(--badge-emerald-border)]";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border-[var(--badge-amber-border)]";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] border-[var(--badge-orange-border)]";
  } else if (type === "Trạng từ" || type === "Trạng từ (副詞)") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-cyan-bg)] text-[var(--badge-cyan-text)] border-[var(--badge-cyan-border)]";
  } else if (type === "Ngữ pháp") {
    return "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-[var(--badge-indigo-bg)] text-[var(--badge-indigo-text)] border-[var(--badge-indigo-border)]";
  }
  return defaultClasses;
}`;
    code = code.replace(t0, r0);
  }
  
  if (file.includes('IntensiveStudy.tsx')) {
    const t0 = `export function getIntensiveWordTypeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold   px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border    ";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold   px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border    ";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold   px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border    ";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold   px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border    ";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold   px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border    ";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold   px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border    ";
  }
  return defaultClasses;
}`;
    const r0 = `export function getIntensiveWordTypeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border-[var(--badge-blue-border)]";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border-[var(--badge-purple-border)]";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] border-[var(--badge-pink-border)]";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border-[var(--badge-emerald-border)]";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border-[var(--badge-amber-border)]";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] border-[var(--badge-orange-border)]";
  }
  return defaultClasses;
}`;
    code = code.replace(t0, r0);
  }
  
  if (file.includes('Dashboard.tsx')) {
    const t0 = `res.type === 'intensive' ? '  border   ' : '  border   '`;
    const r0 = `res.type === 'intensive' ? 'bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border border-[var(--badge-amber-border)]' : 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border border-[var(--badge-emerald-border)]'`;
    code = code.replace(t0, r0);
  }

  fs.writeFileSync(file, code);
}

patch('src/components/VocabList.tsx');
patch('src/components/IntensiveStudy.tsx');
patch('src/components/Dashboard.tsx');
