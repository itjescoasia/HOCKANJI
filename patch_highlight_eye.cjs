const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target = `<button
                    onClick={(e) => playAudio(e, text)}
                    className="p-2 rounded-full text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10 transition-colors shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>`;

const replacement = `<button
                    onClick={(e) => playAudio(e, text)}
                    className="p-2 rounded-full text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10 transition-colors shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); window.dispatchEvent(new CustomEvent('viewCard', { detail: card })); }}
                    className="p-2 rounded-full text-theme-primary/40 hover:text-blue-500 hover:bg-blue-500/10 transition-colors shrink-0"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>`;

code = code.replace(target, replacement);

if (!code.includes("import { Volume2, Edit2, Eye }")) {
  code = code.replace("import { Volume2, Edit2 } from 'lucide-react';", "import { Volume2, Edit2, Eye } from 'lucide-react';");
}

fs.writeFileSync('src/utils/highlight.tsx', code);
