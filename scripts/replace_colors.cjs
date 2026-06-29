const fs = require('fs');
const path = require('path');

const colorMap = {
  // Backgrounds
  'bg-[#0a0a0a]': 'bg-theme-base',
  'bg-[#0c0c0c]': 'bg-theme-base-alt',
  'bg-[#121212]': 'bg-theme-panel',
  'bg-[#1a1a1a]': 'bg-theme-hover',
  'bg-[#2a2a2a]': 'bg-theme-active',
  'bg-[#333333]': 'bg-theme-active-alt',
  
  // Borders
  'border-[#2a2a2a]': 'border-theme-subtle',
  'border-[#3a3a3a]': 'border-theme-strong',
  
  // Texts
  'text-[#d4d4d4]': 'text-theme-primary',
  'text-[#4a4a4a]': 'text-theme-muted',
  'text-[#8b5a2b]': 'text-theme-accent-dark',
  'text-[#2a2a2a]': 'text-theme-inverted', // Sometimes used for text on accent
  'text-[#121212]': 'text-theme-inverted',
  
  // Accents
  'text-[#c5a059]': 'text-theme-accent',
  'bg-[#c5a059]': 'bg-theme-accent',
  'border-[#c5a059]': 'border-theme-accent',
  'text-[#b08d4a]': 'text-theme-accent-hover',
  'bg-[#b08d4a]': 'bg-theme-accent-hover',
  'border-[#b08d4a]': 'border-theme-accent-hover',
  'bg-[#d6af6a]': 'bg-theme-accent-light',
  'bg-[#d6b16a]': 'bg-theme-accent-light',
};

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [hexClass, semanticClass] of Object.entries(colorMap)) {
        // We use split/join to replace all occurrences globally
        if (content.includes(hexClass)) {
          content = content.split(hexClass).join(semanticClass);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceColors('./src');
