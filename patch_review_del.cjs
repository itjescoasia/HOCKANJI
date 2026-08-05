const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const target = `  const handleDeleteCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
      onDeleteCard(currentCard.id);
    }
  };`;
const newTarget = `  const handleDeleteCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingDeleteId(currentCard.id);
  };`;

content = content.replace(target, newTarget);

const targetState = `  const [isDeleting, setIsDeleting] = useState(false);`;
const newState = `  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);`;
content = content.replace(targetState, newState);

const modalCode = `      {confirmingDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} />
          <div className="bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-serif text-theme-primary mb-4 text-red-500">Xóa từ vựng?</h3>
            <p className="text-theme-primary/70 mb-6">Bạn có chắc chắn muốn xóa từ vựng này không?</p>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} className="px-4 py-2 text-theme-primary/60 hover:text-theme-primary text-sm uppercase tracking-wider">Hủy</button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCard(confirmingDeleteId);
                  setConfirmingDeleteId(null);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-sm hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace('    </div>\n  );\n}', modalCode + '    </div>\n  );\n}');
fs.writeFileSync('src/components/ReviewSession.tsx', content);
console.log("Patched ReviewSession delete modal");
