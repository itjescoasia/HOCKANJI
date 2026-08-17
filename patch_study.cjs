const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(ex.sentence);
                                        const btn = e.currentTarget;
                                        const originalHTML = btn.innerHTML;
                                        btn.innerHTML = '<svg class="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                                        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
                                      }}
                                      className="inline-flex items-center justify-center p-2 ml-1 text-theme-primary/40 hover:text-theme-accent transition-colors align-middle rounded-full hover:bg-theme-accent/10"
                                      title="Copy câu ví dụ"
                                    >
                                      <Copy className="w-5 h-5" />
                                    </button>`;

if (code.includes(target)) {
  code = code.replace(target, '');
  fs.writeFileSync(file, code);
  console.log("Patched successfully.");
} else {
  console.log("Target not found.");
}
