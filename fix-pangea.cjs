const fs = require('fs');

let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf-8');

// Add import
code = code.replace(/import \{ motion, AnimatePresence \} from 'motion\/react';/, "import { motion, AnimatePresence } from 'motion/react';\nimport { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';");

code = code.replace(/import \{ PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Eye, EyeOff, ChevronUp, ChevronDown \} from 'lucide-react';/, "import { PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Eye, EyeOff, GripVertical } from 'lucide-react';");

const oldExampleItem = `  const ExampleItem = ({ ex, index }: { ex: IntensiveExample, index: number }) => {
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

const newExampleItem = `  const ExampleItem = ({ ex, index }: { ex: IntensiveExample, index: number }) => {
    return (
      <Draggable draggableId={ex.id} index={index} isDragDisabled={editingExampleId === ex.id}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={\`relative rounded-lg overflow-hidden border \${snapshot.isDragging ? 'border-[#c5a059] shadow-2xl z-50' : 'border-[#2a2a2a]'} bg-[#121212] group mb-4\`}
            style={provided.draggableProps.style}
          >
            <div className={\`bg-[#1a1a1a] p-6 relative z-10 w-full min-h-full \${!editingExampleId ? 'pl-14' : ''}\`}>
               {/* Drag Handle */}
               {!editingExampleId && (
                 <div 
                   {...provided.dragHandleProps}
                   className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-[#d4d4d4]/20 hover:text-[#c5a059] transition-colors z-20 border-r border-[#2a2a2a]"
                 >
                   <GripVertical className="w-5 h-5" />
                 </div>
               )}`;

code = code.replace(oldExampleItem, newExampleItem);

code = code.replace(/         <\/div>\n      <\/motion.div>/g, '         </div>\n          </div>\n        )}\n      </Draggable>');

const oldReorderGroup = `        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {word.examples.map((ex, index) => (
              <ExampleItem key={ex.id} ex={ex} index={index} />
            ))}
          </AnimatePresence>
        </div>`;

const newReorderGroup = `        <DragDropContext 
          onDragEnd={(result: DropResult) => {
            if (!result.destination) return;
            const newExamples = Array.from(word.examples);
            const [reorderedItem] = newExamples.splice(result.source.index, 1);
            newExamples.splice(result.destination.index, 0, reorderedItem);
            onUpdateWord(word.id, { examples: newExamples });
          }}
        >
          <Droppable droppableId="examples">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
              >
                {word.examples.map((ex, index) => (
                  <ExampleItem key={ex.id} ex={ex} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>`;

code = code.replace(oldReorderGroup, newReorderGroup);

fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
console.log('Fixed');
