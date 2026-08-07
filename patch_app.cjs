const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replaceAll(
  `useState<'dark' | 'light' | 'sepia'>`,
  `useState<'dark' | 'light' | 'sepia' | 'dim'>`
);

content = content.replaceAll(
  `if (saved === 'dark' || saved === 'light' || saved === 'sepia') {
      return saved as 'dark' | 'light' | 'sepia';`,
  `if (saved === 'dark' || saved === 'light' || saved === 'sepia' || saved === 'dim') {
      return saved as 'dark' | 'light' | 'sepia' | 'dim';`
);

content = content.replaceAll(
  `} else if (theme === 'sepia') {
      document.documentElement.className = 'theme-sepia';
    }`,
  `} else if (theme === 'sepia') {
      document.documentElement.className = 'theme-sepia';
    } else if (theme === 'dim') {
      document.documentElement.className = 'theme-dim';
    }`
);

content = content.replaceAll(
  `<button
              onClick={() => {
                if (theme === 'dark') setTheme('light');
                else if (theme === 'light') setTheme('sepia');
                else setTheme('dark');
              }}
              className="p-2 text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover rounded transition-all"
              title="Đổi màu nền"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : theme === 'light' ? <Coffee className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>`,
  `<button
              onClick={() => {
                if (theme === 'dark') setTheme('light');
                else if (theme === 'light') setTheme('sepia');
                else if (theme === 'sepia') setTheme('dim');
                else setTheme('dark');
              }}
              className="p-2 text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover rounded transition-all"
              title="Đổi màu nền"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : theme === 'light' ? <Coffee className="w-4 h-4" /> : theme === 'sepia' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 opacity-70" />}
            </button>`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
