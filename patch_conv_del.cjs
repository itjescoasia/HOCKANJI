const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const target = `                                          if (confirm("Bạn có chắc chắn muốn xóa chủ đề này không? Toàn bộ các câu hội thoại bên trong sẽ bị mất.")) {
                                            onRemoveConversation(conv.id);
                                          }`;
const newTarget = `                                          setConfirmingDeleteId(conv.id);`;

content = content.replace(target, newTarget);

const targetState = `  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);`;
const newState = `  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);`;
content = content.replace(targetState, newState);

const modalCode = `      {confirmingDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmingDeleteId(null)} />
          <div className="bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 flex flex-col">
            <h3 className="text-xl font-serif text-theme-primary mb-4 text-red-500">Xóa chủ đề?</h3>
            <p className="text-theme-primary/70 mb-6">Bạn có chắc chắn muốn xóa chủ đề này không? Toàn bộ các câu hội thoại bên trong sẽ bị mất.</p>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setConfirmingDeleteId(null)} className="px-4 py-2 text-theme-primary/60 hover:text-theme-primary text-sm uppercase tracking-wider">Hủy</button>
              <button 
                onClick={() => {
                  onRemoveConversation(confirmingDeleteId);
                  setConfirmingDeleteId(null);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-sm hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace('    </AnimatePresence>', modalCode + '\n    </AnimatePresence>');
fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched ConversationView delete modal");
