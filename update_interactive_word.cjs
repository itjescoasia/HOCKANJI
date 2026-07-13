const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

content = content.replace(
  `import { Volume2 } from 'lucide-react';`,
  `import { Volume2, Edit2 } from 'lucide-react';`
);

content = content.replace(
  `const { setHoveredCard } = useContext(HighlightContext);`,
  `const { setHoveredCard, onEditCard } = useContext(HighlightContext);`
);

const editButtonHtml = `              {onEditCard && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEditCard(card); }}
                  className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 ml-1"
                  title="Chỉnh sửa từ vựng"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}`;

content = content.replace(
  `                <Volume2 className="w-4 h-4" />
              </button>`,
  `                <Volume2 className="w-4 h-4" />
              </button>
${editButtonHtml}`
);

fs.writeFileSync('src/utils/highlight.tsx', content);
