const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

const sepiaTheme = `.theme-sepia {
  /* Warm Sepia Mode */
  --bg-base: #f4ecd8;
  --bg-base-alt: #eee4cc;
  --bg-panel: #f8f3e5;
  --bg-hover: #e6dac3;
  --bg-active: #dccba8;
  --bg-active-alt: #cdb992;
  
  --border-subtle: #e0d0b0;
  --border-strong: #cdb992;
  
  --text-primary: #5c4b37;
  --text-muted: #8a7862;
  --text-accent-dark: #8c5620;
  --text-inverted: #f8f3e5;
  --text-japanese: #4a3620;
  
  --accent: #a66a2b;
  --accent-hover: #8c5620;
  --accent-light: #c28243;
}`;

const dimTheme = `.theme-dim {
  /* Soft Night Mode (Eye-friendly dark blue/grey) */
  --bg-base: #15202b;
  --bg-base-alt: #192734;
  --bg-panel: #1e2f3d;
  --bg-hover: #223545;
  --bg-active: #2c4255;
  --bg-active-alt: #385268;
  
  --border-subtle: #2c4255;
  --border-strong: #385268;
  
  --text-primary: #e4e6eb;
  --text-muted: #8899a6;
  --text-accent-dark: #4b8cc4;
  --text-inverted: #15202b;
  --text-japanese: #88c0d0;
  
  --accent: #81a1c1;
  --accent-hover: #5e81ac;
  --accent-light: #88c0d0;
}`;

content = content.replace(sepiaTheme, sepiaTheme + '\\n\\n' + dimTheme);

fs.writeFileSync('src/index.css', content);
console.log("Patched index.css for theme-dim");
