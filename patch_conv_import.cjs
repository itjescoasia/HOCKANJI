const fs = require('fs');
const file = 'src/components/ConversationView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `import { PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Check, X, Info, Lightbulb, Lock, Unlock, GripVertical, List, Presentation, ChevronLeft, ChevronRight, Copy, Brain, Volume2, Download } from "lucide-react";`,
  `import { PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Check, X, Info, Lightbulb, Lock, Unlock, GripVertical, List, Presentation, ChevronLeft, ChevronRight, Copy, Brain, Volume2, Download, Eye } from "lucide-react";`
);

fs.writeFileSync(file, content);
console.log('Patched imports in ConversationView');
