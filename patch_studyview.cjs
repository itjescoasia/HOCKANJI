const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

// 1. Add exampleSearchQuery state
code = code.replace(
  'const [newSpecialNote, setNewSpecialNote] = useState("");',
  'const [newSpecialNote, setNewSpecialNote] = useState("");\n  const [exampleSearchQuery, setExampleSearchQuery] = useState("");'
);

// 2. Add filteredExamples computation
const filteredExamplesCode = `  const filteredExamples = React.useMemo(() => {
    if (!exampleSearchQuery.trim()) return word.examples;
    const q = exampleSearchQuery.toLowerCase();
    return word.examples.filter(ex => 
      ex.sentence?.toLowerCase().includes(q) ||
      ex.translation?.toLowerCase().includes(q) ||
      ex.reading?.toLowerCase().includes(q) ||
      ex.romaji?.toLowerCase().includes(q) ||
      ex.specialNote?.toLowerCase().includes(q)
    );
  }, [word.examples, exampleSearchQuery]);`;

code = code.replace(
  'const [isEditing, setIsEditing] = useState(false);',
  filteredExamplesCode + '\n  const [isEditing, setIsEditing] = useState(false);'
);

// 3. Add Search Input UI
const searchUI = `<div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-theme-primary opacity-40" />
          </div>
          <input
            type="text"
            value={exampleSearchQuery}
            onChange={(e) => setExampleSearchQuery(e.target.value)}
            className="w-full bg-theme-base-alt border border-theme-subtle py-2.5 pl-10 pr-4 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors text-sm rounded-md"
            placeholder="Tìm kiếm câu ví dụ (Tiếng Nhật, Romaji, Tiếng Việt...)"
          />
        </div>`;

code = code.replace(
  '      {/* Examples List */}\n      <div className="space-y-6">',
  '      {/* Examples List */}\n      <div className="space-y-6">\n        ' + searchUI
);

// 4. Update the drag-and-drop to use filteredExamples and disable drag when searching
code = code.replace(
  `        <DragDropContext
          onDragEnd={(result: DropResult) => {
            if (!result.destination) return;
            const newExamples = Array.from(word.examples);
            const [reorderedItem] = newExamples.splice(result.source.index, 1);
            newExamples.splice(result.destination.index, 0, reorderedItem);
            onUpdateWord(word.id, { examples: newExamples });
          }}
        >`,
  `        <DragDropContext
          onDragEnd={(result: DropResult) => {
            if (!result.destination) return;
            if (exampleSearchQuery.trim()) return; // Disable reorder when searching
            const newExamples = Array.from(word.examples);
            const [reorderedItem] = newExamples.splice(result.source.index, 1);
            newExamples.splice(result.destination.index, 0, reorderedItem);
            onUpdateWord(word.id, { examples: newExamples });
          }}
        >`
);

code = code.replace(
  '{word.examples.map((ex, index) => (',
  '{filteredExamples.map((ex, index) => ('
);

code = code.replace(
  'isDragDisabled={editingExampleId === ex.id}',
  'isDragDisabled={editingExampleId === ex.id || !!exampleSearchQuery.trim()}'
);

// We should also replace the count in "Các Câu Ví Dụ ({word.examples.length})"
code = code.replace(
  'Các Câu Ví Dụ ({word.examples.length})',
  'Các Câu Ví Dụ ({filteredExamples.length}{exampleSearchQuery.trim() ? ` / ${word.examples.length}` : ""})'
);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
