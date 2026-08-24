const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else if (theme === 'sepia') {
      document.documentElement.classList.add('theme-sepia');
    }`,
  `    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else if (theme === 'sepia') {
      document.documentElement.classList.add('theme-sepia');
    } else if (theme === 'dim') {
      document.documentElement.classList.add('theme-dim');
    }`
);

fs.writeFileSync('src/App.tsx', code);
