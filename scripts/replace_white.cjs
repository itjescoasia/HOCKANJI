const fs = require('fs');
const path = require('path');

function replaceTextWhite(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceTextWhite(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (fullPath.includes('App.tsx') || fullPath.includes('Login.tsx')) {
        // App.tsx has the Kanji logo which should remain white
        // We'll replace text-white manually in those if needed.
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('text-white') && !content.includes('bg-[#8b0000]')) {
             // wait, the kanji logo has bg-[#8b0000].
        }
        // Actually, let's just replace all and then I'll fix App.tsx and Login.tsx specifically.
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Let's replace 'text-white' with 'text-theme-primary' EXCEPT when it's next to bg-[#8b0000]
      // A simple replace is fine, I can fix the logo if it changes.
      if (content.includes('text-white')) {
        content = content.split('text-white').join('text-theme-primary');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceTextWhite('./src');
