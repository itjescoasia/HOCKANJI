const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetState = `  const [deleteEnabled, setDeleteEnabled] = useState(false);`;
content = content.replace(targetState, targetState + `\n  const [confirmingConvert, setConfirmingConvert] = useState(false);`);

const targetBtn = `            <button
              onClick={() => {
                if (!onAddIntensiveWord) return;
                if (!confirm("Bạn có muốn chuyển hội thoại này thành một Chuyên đề và xóa khỏi đây không?")) return;
                
                const newWord = {
                  id: String(Date.now()) + Math.random().toString(36).slice(2),
                  word: conversation.title,
                  reading: "",
                  category: "Khác",
                  explanation: conversation.description || "",
                  examples: conversation.dialogues.map(d => ({
                    id: d.id,
                    sentence: d.japanese,
                    reading: d.hiragana,
                    romaji: d.romaji,
                    translation: d.vietnamese,
                    specialNote: d.explanation || "",
                    hasAudio: d.hasAudio,
                    audioUrl: d.audioUrl
                  })),
                  createdAt: Date.now()
                };
                
                onAddIntensiveWord(newWord);
                onRemoveConversation(conversation.id);
                onBack();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all border rounded shrink-0 bg-theme-base text-theme-primary/60 border-theme-subtle hover:text-theme-primary hover:border-theme-primary/60"
              title="Chuyển thành Chuyên đề"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chuyển sang Chuyên đề</span>
            </button>`;

const newBtn = `            <button
              onClick={() => setConfirmingConvert(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all border rounded shrink-0 bg-theme-base text-theme-primary/60 border-theme-subtle hover:text-theme-primary hover:border-theme-primary/60"
              title="Chuyển thành Chuyên đề"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chuyển sang Chuyên đề</span>
            </button>`;

content = content.replace(targetBtn, newBtn);

const targetModalPosition = `      {/* Modal for Moving Dialogue */}`;
const modalCode = `      {/* Modal for Converting to Topic */}
      {confirmingConvert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmingConvert(false)} />
          <div className="bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 flex flex-col">
            <h3 className="text-xl font-serif text-theme-primary mb-4">Chuyển thành Chuyên đề</h3>
            <p className="text-theme-primary/70 mb-6">Bạn có muốn chuyển hội thoại này thành một Chuyên đề học sâu và xóa khỏi đây không?</p>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setConfirmingConvert(false)} className="px-4 py-2 text-theme-primary/60 hover:text-theme-primary text-sm uppercase tracking-wider">Hủy</button>
              <button 
                onClick={() => {
                  if (!onAddIntensiveWord) return;
                  const newWord = {
                    id: String(Date.now()) + Math.random().toString(36).slice(2),
                    word: conversation.title,
                    reading: "",
                    category: "Khác",
                    explanation: conversation.description || "",
                    examples: conversation.dialogues.map(d => ({
                      id: d.id,
                      sentence: d.japanese,
                      reading: d.hiragana,
                      romaji: d.romaji,
                      translation: d.vietnamese,
                      specialNote: d.explanation || "",
                      hasAudio: d.hasAudio,
                      audioUrl: d.audioUrl
                    })),
                    createdAt: Date.now()
                  };
                  onAddIntensiveWord(newWord);
                  onRemoveConversation(conversation.id);
                  onBack();
                  setConfirmingConvert(false);
                }}
                className="bg-theme-accent text-theme-inverted px-6 py-2 rounded font-bold uppercase tracking-widest text-sm hover:opacity-90"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Moving Dialogue */}`;

content = content.replace(targetModalPosition, modalCode);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched ConversationView");
