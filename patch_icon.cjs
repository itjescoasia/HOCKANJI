const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { BookMarked, Home, PlusCircle, LogOut, Lightbulb, Sun, Moon, MessageSquare, Coffee } from 'lucide-react';",
  "import { BookMarked, Home, PlusCircle, LogOut, Lightbulb, Sun, Moon, MessageSquare, Coffee, CloudMoon } from 'lucide-react';"
);

content = content.replace(
  "{theme === 'dark' ? <Sun className=\"w-4 h-4\" /> : theme === 'light' ? <Coffee className=\"w-4 h-4\" /> : theme === 'sepia' ? <Moon className=\"w-4 h-4\" /> : <Sun className=\"w-4 h-4 opacity-70\" />}",
  "{theme === 'dark' ? <Sun className=\"w-4 h-4\" /> : theme === 'light' ? <Coffee className=\"w-4 h-4\" /> : theme === 'sepia' ? <Moon className=\"w-4 h-4\" /> : <CloudMoon className=\"w-4 h-4\" />}"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched icon");
