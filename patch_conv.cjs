const fs = require('fs');
const content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const target1 = `import { renderExampleHighlight, tokenizeExampleText, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";`;
const replacement1 = `import { renderExampleHighlight, tokenizeExampleText, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";
import { normalizeSentence } from "../utils/stringUtils";`;

const target2 = `  const [editingId, setEditingId] = useState<string | null>(null);`;
const replacement2 = `  const [duplicateWarningId, setDuplicateWarningId] = useState<string | null>(null);
  const [highlightedExampleId, setHighlightedExampleId] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (newJp.trim()) {
      const existing = conversation.dialogues.find(
        (d) => normalizeSentence(d.japanese) === normalizeSentence(newJp)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      setDuplicateWarningId(null);
    }
  }, [newJp, conversation.dialogues]);

  useEffect(() => {
    if (editingId && editJp.trim()) {
      const existing = conversation.dialogues.find(
        (d) => d.id !== editingId && normalizeSentence(d.japanese) === normalizeSentence(editJp)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      if (!newJp.trim()) {
        setDuplicateWarningId(null);
      }
    }
  }, [editJp, editingId, conversation.dialogues, newJp]);`;

const target3 = `  const handleAddDialogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJp.trim()) return;`;
const replacement3 = `  const handleAddDialogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJp.trim()) return;

    const existingDialogue = conversation.dialogues.find(
      (d) => normalizeSentence(d.japanese) === normalizeSentence(newJp)
    );

    if (existingDialogue) {
      setDuplicateWarningId(existingDialogue.id);
      return;
    }`;

const target4 = `  const handleUpdateDialogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJp.trim() || !editingId) return;`;
const replacement4 = `  const handleUpdateDialogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJp.trim() || !editingId) return;

    const existingDialogue = conversation.dialogues.find(
      (d) => d.id !== editingId && normalizeSentence(d.japanese) === normalizeSentence(editJp)
    );

    if (existingDialogue) {
      setDuplicateWarningId(existingDialogue.id);
      return;
    }`;

const target5 = `            <h4 className="text-theme-accent uppercase tracking-wider text-xs font-medium mb-4">
              Thêm câu hội thoại
            </h4>`;
const replacement5 = `            <h4 className="text-theme-accent uppercase tracking-wider text-xs font-medium mb-4">
              Thêm câu hội thoại
            </h4>
            {duplicateWarningId && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Câu thoại này đã tồn tại!</p>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(\`dialogue-\${duplicateWarningId}\`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        setHighlightedExampleId(duplicateWarningId);
                        setTimeout(() => setHighlightedExampleId(null), 3000);
                      }
                    }}
                    className="text-xs underline hover:text-red-400 transition-colors"
                  >
                    Nhấn vào đây để xem câu hiện có
                  </button>
                </div>
              </div>
            )}`;

const target6 = `                          {editingId === dialogue.id ? (
                            <form onSubmit={handleUpdateDialogue} className="space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="text-theme-accent text-xs font-bold uppercase tracking-widest">Sửa câu {index + 1}</span>
                              </div>`;
const replacement6 = `                          {editingId === dialogue.id ? (
                            <form onSubmit={handleUpdateDialogue} className="space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="text-theme-accent text-xs font-bold uppercase tracking-widest">Sửa câu {index + 1}</span>
                              </div>
                              {duplicateWarningId && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg flex items-start gap-3 mb-4">
                                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-sm mb-1">Câu thoại này đã tồn tại!</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const el = document.getElementById(\`dialogue-\${duplicateWarningId}\`);
                                        if (el) {
                                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                                          setHighlightedExampleId(duplicateWarningId);
                                          setTimeout(() => setHighlightedExampleId(null), 3000);
                                        }
                                      }}
                                      className="text-xs underline hover:text-red-400 transition-colors"
                                    >
                                      Nhấn vào đây để xem câu hiện có
                                    </button>
                                  </div>
                                </div>
                              )}`;

const target7 = `                          {editingId !== dialogue.id && !deleteEnabled && (
                            <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-theme-primary/20 hover:text-theme-primary/60 cursor-grab active:cursor-grabbing transition-colors" {...provided.dragHandleProps}>`;
const replacement7 = `                          {editingId !== dialogue.id && !deleteEnabled && (
                            <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-theme-primary/20 hover:text-theme-primary/60 cursor-grab active:cursor-grabbing transition-colors" {...provided.dragHandleProps}>`;

const target8 = `                      <Draggable
                        key={dialogue.id}
                        draggableId={dialogue.id}
                        index={index}
                        isDragDisabled={editingId === dialogue.id || deleteEnabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={\`relative overflow-hidden transition-all duration-200 \${
                              snapshot.isDragging 
                                ? 'bg-theme-panel border-theme-accent shadow-2xl scale-[1.02] z-50' 
                                : 'bg-theme-base border-theme-subtle hover:border-theme-primary/30 shadow-md'
                            } border rounded-lg group mb-4\`}`;
const replacement8 = `                      <Draggable
                        key={dialogue.id}
                        draggableId={dialogue.id}
                        index={index}
                        isDragDisabled={editingId === dialogue.id || deleteEnabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            id={\`dialogue-\${dialogue.id}\`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={\`relative overflow-hidden transition-all duration-200 \${
                              snapshot.isDragging 
                                ? 'bg-theme-panel border-theme-accent shadow-2xl scale-[1.02] z-50' 
                                : highlightedExampleId === dialogue.id
                                ? 'bg-theme-hover border-theme-accent shadow-[0_0_15px_rgba(var(--color-accent),0.5)] scale-[1.01]'
                                : 'bg-theme-base border-theme-subtle hover:border-theme-primary/30 shadow-md'
                            } border rounded-lg group mb-4\`}`;

let newContent = content.replace(target1, replacement1).replace(target2, replacement2).replace(target3, replacement3).replace(target4, replacement4).replace(target5, replacement5).replace(target6, replacement6).replace(target8, replacement8);

fs.writeFileSync('src/components/ConversationView.tsx', newContent);
console.log("Success");
