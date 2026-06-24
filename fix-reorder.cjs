const fs = require('fs');

let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf-8');

code = code.replace(/import \{ motion, AnimatePresence, Reorder, useDragControls \} from 'motion\/react';/, "import { motion, AnimatePresence } from 'motion/react';");

code = code.replace(/import \{ PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Eye, EyeOff, GripVertical \} from 'lucide-react';/, "import { PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';");

// we don't need localExamples state and effect anymore!
code = code.replace(/  const \[localExamples, setLocalExamples\] = React.useState\(word.examples\);\n  const localExamplesRef = React.useRef\(word.examples\);\n\n  React.useEffect\(\(\) => \{\n    setLocalExamples\(word.examples\);\n    localExamplesRef.current = word.examples;\n  \}, \[word.examples\]\);\n\n  const handleReorder = \(newOrder: IntensiveExample\[\]\) => \{\n    setLocalExamples\(newOrder\);\n    localExamplesRef.current = newOrder;\n  \};\n/, '');

// Replace ExampleItem
const oldExampleItem = `  const ExampleItem = ({ ex, index }: { ex: IntensiveExample, index: number }) => {
    const dragControls = useDragControls();

    return (
      <Reorder.Item 
        value={ex} 
        dragListener={false} 
        dragControls={dragControls}
        onDragEnd={() => {
          onUpdateWord(word.id, { examples: localExamplesRef.current });
        }}
        className="relative rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#121212] group"
      >
        {/* Delete Background */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-600/90 flex flex-col items-center justify-center text-white z-0">
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Xoá</span>
        </div>

        <div className={\`bg-[#1a1a1a] p-6 relative z-10 w-full min-h-full \${!editingExampleId ? 'pl-14' : ''}\`}>
           {/* Drag Handle */}
           {!editingExampleId && (
             <div 
               onPointerDown={(e) => dragControls.start(e)}
               className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-[#d4d4d4]/20 hover:text-[#c5a059] transition-colors z-20 touch-none border-r border-[#2a2a2a]"
             >
               <GripVertical className="w-5 h-5" />
             </div>
           )}`;

const newExampleItem = `  const ExampleItem = ({ ex, index }: { ex: IntensiveExample, index: number }) => {
    const moveUp = (idx: number) => {
      if (idx === 0) return;
      const newExamples = [...word.examples];
      const temp = newExamples[idx - 1];
      newExamples[idx - 1] = newExamples[idx];
      newExamples[idx] = temp;
      onUpdateWord(word.id, { examples: newExamples });
    };

    const moveDown = (idx: number) => {
      if (idx === word.examples.length - 1) return;
      const newExamples = [...word.examples];
      const temp = newExamples[idx + 1];
      newExamples[idx + 1] = newExamples[idx];
      newExamples[idx] = temp;
      onUpdateWord(word.id, { examples: newExamples });
    };

    return (
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#121212] group"
      >
        <div className={\`bg-[#1a1a1a] p-6 relative z-10 w-full min-h-full \${!editingExampleId ? 'pl-14' : ''}\`}>
           {/* Move Up/Down Controls */}
           {!editingExampleId && (
             <div 
               className="absolute left-0 top-0 bottom-0 w-12 flex flex-col items-center justify-center text-[#d4d4d4]/40 transition-colors z-20 border-r border-[#2a2a2a]"
             >
               <button 
                 onClick={() => moveUp(index)} 
                 disabled={index === 0} 
                 className="p-2 hover:text-[#c5a059] disabled:opacity-20 disabled:hover:text-[#d4d4d4]/40"
                 title="Lên"
               >
                 <ChevronUp className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => moveDown(index)} 
                 disabled={index === word.examples.length - 1} 
                 className="p-2 hover:text-[#c5a059] disabled:opacity-20 disabled:hover:text-[#d4d4d4]/40"
                 title="Xuống"
               >
                 <ChevronDown className="w-5 h-5" />
               </button>
             </div>
           )}`;

code = code.replace(oldExampleItem, newExampleItem);

code = code.replace(/         <\/div>\n      <\/Reorder\.Item>/g, '         </div>\n      </motion.div>');

const oldReorderGroup = `        <Reorder.Group 
          axis="y" 
          values={localExamples} 
          onReorder={handleReorder}
          className="flex flex-col gap-4"
        >
          {localExamples.map((ex, index) => (
            <ExampleItem key={ex.id} ex={ex} index={index} />
          ))}
        </Reorder.Group>`;

const newReorderGroup = `        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {word.examples.map((ex, index) => (
              <ExampleItem key={ex.id} ex={ex} index={index} />
            ))}
          </AnimatePresence>
        </div>`;

code = code.replace(oldReorderGroup, newReorderGroup);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
console.log('Fixed');
