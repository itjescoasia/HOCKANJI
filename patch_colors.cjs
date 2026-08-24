const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const newRoot = `:root {
  --badge-blue-bg: rgba(30, 58, 138, 0.3);
  --badge-blue-text: #93c5fd;
  --badge-blue-border: rgba(30, 64, 175, 0.5);
  
  --badge-purple-bg: rgba(88, 28, 135, 0.3);
  --badge-purple-text: #d8b4fe;
  --badge-purple-border: rgba(107, 33, 168, 0.5);
  
  --badge-pink-bg: rgba(131, 24, 67, 0.3);
  --badge-pink-text: #f9a8d4;
  --badge-pink-border: rgba(157, 23, 77, 0.5);
  
  --badge-emerald-bg: rgba(6, 78, 59, 0.3);
  --badge-emerald-text: #6ee7b7;
  --badge-emerald-border: rgba(6, 95, 70, 0.5);
  
  --badge-amber-bg: rgba(120, 53, 15, 0.3);
  --badge-amber-text: #fcd34d;
  --badge-amber-border: rgba(146, 64, 14, 0.5);
  
  --badge-orange-bg: rgba(124, 45, 18, 0.3);
  --badge-orange-text: #fdba74;
  --badge-orange-border: rgba(154, 52, 18, 0.5);
  
  --badge-cyan-bg: rgba(12, 74, 110, 0.3);
  --badge-cyan-text: #7dd3fc;
  --badge-cyan-border: rgba(7, 89, 133, 0.5);
  
  --badge-indigo-bg: rgba(49, 46, 129, 0.3);
  --badge-indigo-text: #a5b4fc;
  --badge-indigo-border: rgba(55, 48, 163, 0.5);

  /* Ergonomic Dark Mode: Material Design Standard */
  --bg-base: #121212;
  --bg-base-alt: #18181b;
  --bg-panel: #1e1e1e;
  --bg-hover: #27272a;
  --bg-active: #3f3f46;
  --bg-active-alt: #52525b;
  
  --border-subtle: #27272a;
  --border-strong: #3f3f46;
  
  /* Text colors balanced for astigmatism (not pure white) */
  --text-primary: #e4e4e7;
  --text-muted: #a1a1aa;
  --text-accent-dark: #8b5a2b;
  --text-inverted: #09090b;
  --text-japanese: #dbeafe; 
  
  --accent: #c5a059;
  --accent-hover: #b08d4a;
  --accent-light: #d6b16a;
}`;

const newLight = `.theme-light {
  --badge-blue-bg: #dbeafe;
  --badge-blue-text: #1d4ed8;
  --badge-blue-border: #bfdbfe;
  
  --badge-purple-bg: #f3e8ff;
  --badge-purple-text: #7e22ce;
  --badge-purple-border: #e9d5ff;
  
  --badge-pink-bg: #fce7f3;
  --badge-pink-text: #be185d;
  --badge-pink-border: #fbcfe8;
  
  --badge-emerald-bg: #d1fae5;
  --badge-emerald-text: #047857;
  --badge-emerald-border: #a7f3d0;
  
  --badge-amber-bg: #fef3c7;
  --badge-amber-text: #b45309;
  --badge-amber-border: #fde68a;
  
  --badge-orange-bg: #ffedd5;
  --badge-orange-text: #c2410c;
  --badge-orange-border: #fed7aa;
  
  --badge-cyan-bg: #cffafe;
  --badge-cyan-text: #0369a1;
  --badge-cyan-border: #a5f3fc;
  
  --badge-indigo-bg: #e0e7ff;
  --badge-indigo-text: #4338ca;
  --badge-indigo-border: #c7d2fe;

  /* Ergonomic Light Mode: Anti-glare paper white */
  --bg-base: #f9f9f8;
  --bg-base-alt: #f3f3f1;
  --bg-panel: #ffffff;
  --bg-hover: #eaeae8;
  --bg-active: #dcdcda;
  --bg-active-alt: #cececc;
  
  --border-subtle: #e4e4e2;
  --border-strong: #d1d1ce;
  
  /* Text colors balanced to reduce contrast fatigue */
  --text-primary: #27272a;
  --text-muted: #71717a;
  --text-accent-dark: #b07d35;
  --text-inverted: #ffffff;
  --text-japanese: #1e3a8a;
  
  --accent: #b07d35;
  --accent-hover: #966829;
  --accent-light: #c49551;
}`;

const newSepia = `.theme-sepia {
  --badge-blue-bg: #e2e6f0;
  --badge-blue-text: #2f4b7c;
  --badge-blue-border: #c7d0e0;
  
  --badge-purple-bg: #eae2f0;
  --badge-purple-text: #665191;
  --badge-purple-border: #d4c7e0;
  
  --badge-pink-bg: #f0e2ea;
  --badge-pink-text: #a05195;
  --badge-pink-border: #e0c7d4;
  
  --badge-emerald-bg: #e2f0e6;
  --badge-emerald-text: #2f7c4b;
  --badge-emerald-border: #c7e0d0;
  
  --badge-amber-bg: #f0ead2;
  --badge-amber-text: #8c6b14;
  --badge-amber-border: #e0d4a8;
  
  --badge-orange-bg: #f0e6d2;
  --badge-orange-text: #9c5c14;
  --badge-orange-border: #e0cc98;
  
  --badge-cyan-bg: #d2eef0;
  --badge-cyan-text: #147a8c;
  --badge-cyan-border: #a8dce0;
  
  --badge-indigo-bg: #e2e2f0;
  --badge-indigo-text: #4b4b9c;
  --badge-indigo-border: #c7c7e0;

  /* Ergonomic Sepia: Optimized warm tones */
  --bg-base: #fbf0d9;
  --bg-base-alt: #f3e6c8;
  --bg-panel: #fffaf0;
  --bg-hover: #eaddbc;
  --bg-active: #dbc69d;
  --bg-active-alt: #c4b087;
  
  --border-subtle: #eaddbc;
  --border-strong: #dbc69d;
  
  /* Text colors: deep warm brown */
  --text-primary: #5f4b32;
  --text-muted: #8c775d;
  --text-accent-dark: #8c5620;
  --text-inverted: #fbf0d9;
  --text-japanese: #4a3620;
  
  --accent: #a66a2b;
  --accent-hover: #8c5620;
  --accent-light: #c28243;
}`;

const newDim = `.theme-dim {
  --badge-blue-bg: rgba(30, 58, 138, 0.3);
  --badge-blue-text: #93c5fd;
  --badge-blue-border: rgba(30, 64, 175, 0.5);
  
  --badge-purple-bg: rgba(88, 28, 135, 0.3);
  --badge-purple-text: #d8b4fe;
  --badge-purple-border: rgba(107, 33, 168, 0.5);
  
  --badge-pink-bg: rgba(131, 24, 67, 0.3);
  --badge-pink-text: #f9a8d4;
  --badge-pink-border: rgba(157, 23, 77, 0.5);
  
  --badge-emerald-bg: rgba(6, 78, 59, 0.3);
  --badge-emerald-text: #6ee7b7;
  --badge-emerald-border: rgba(6, 95, 70, 0.5);
  
  --badge-amber-bg: rgba(120, 53, 15, 0.3);
  --badge-amber-text: #fcd34d;
  --badge-amber-border: rgba(146, 64, 14, 0.5);
  
  --badge-orange-bg: rgba(124, 45, 18, 0.3);
  --badge-orange-text: #fdba74;
  --badge-orange-border: rgba(154, 52, 18, 0.5);
  
  --badge-cyan-bg: rgba(12, 74, 110, 0.3);
  --badge-cyan-text: #7dd3fc;
  --badge-cyan-border: rgba(7, 89, 133, 0.5);
  
  --badge-indigo-bg: rgba(49, 46, 129, 0.3);
  --badge-indigo-text: #a5b4fc;
  --badge-indigo-border: rgba(55, 48, 163, 0.5);

  /* Ergonomic Dim Mode: Slate blue reduction */
  --bg-base: #0f172a;
  --bg-base-alt: #1e293b;
  --bg-panel: #1e293b;
  --bg-hover: #334155;
  --bg-active: #475569;
  --bg-active-alt: #64748b;
  
  --border-subtle: #334155;
  --border-strong: #475569;
  
  /* Text colors: cool slate */
  --text-primary: #f1f5f9;
  --text-muted: #94a3b8;
  --text-accent-dark: #4b8cc4;
  --text-inverted: #0f172a;
  --text-japanese: #88c0d0;
  
  --accent: #81a1c1;
  --accent-hover: #5e81ac;
  --accent-light: #88c0d0;
}`;

code = code.replace(/:root\s*{[^}]*--accent-light:[^}]*}/, newRoot);
code = code.replace(/\.theme-light\s*{[^}]*--accent-light:[^}]*}/, newLight);
code = code.replace(/\.theme-sepia\s*{[^}]*--accent-light:[^}]*}/, newSepia);
code = code.replace(/\.theme-dim\s*{[^}]*--accent-light:[^}]*}/, newDim);

fs.writeFileSync('src/index.css', code);
