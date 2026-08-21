const fs = require('fs');

// 1. Update index.css
let css = fs.readFileSync('src/index.css', 'utf8');

const darkBadges = `
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
`;

const lightBadges = `
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
`;

const sepiaBadges = `
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
`;

if (!css.includes('--badge-blue-bg')) {
  css = css.replace(/:root \{/, ':root {' + darkBadges);
  css = css.replace(/\.theme-light \{/, '.theme-light {' + lightBadges);
  css = css.replace(/\.theme-sepia \{/, '.theme-sepia {' + sepiaBadges);
  css = css.replace(/\.theme-dim \{/, '.theme-dim {' + darkBadges); // reuse dark for dim
  fs.writeFileSync('src/index.css', css);
}

// 2. Update components
function patchComponent(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-blue-[0-9]+\/[0-9]+|bg-blue-[0-9]+|text-blue-[0-9]+|border-blue-[0-9]+\/[0-9]+|border-blue-[0-9]+|dark:bg-blue-[0-9]+\/[0-9]+|dark:text-blue-[0-9]+|dark:border-blue-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/bg-purple-[0-9]+\/[0-9]+|bg-purple-[0-9]+|text-purple-[0-9]+|border-purple-[0-9]+\/[0-9]+|border-purple-[0-9]+|dark:bg-purple-[0-9]+\/[0-9]+|dark:text-purple-[0-9]+|dark:border-purple-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/bg-pink-[0-9]+\/[0-9]+|bg-pink-[0-9]+|text-pink-[0-9]+|border-pink-[0-9]+\/[0-9]+|border-pink-[0-9]+|dark:bg-pink-[0-9]+\/[0-9]+|dark:text-pink-[0-9]+|dark:border-pink-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/bg-emerald-[0-9]+\/[0-9]+|bg-emerald-[0-9]+|text-emerald-[0-9]+|border-emerald-[0-9]+\/[0-9]+|border-emerald-[0-9]+|dark:bg-emerald-[0-9]+\/[0-9]+|dark:text-emerald-[0-9]+|dark:border-emerald-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/bg-amber-[0-9]+\/[0-9]+|bg-amber-[0-9]+|text-amber-[0-9]+|border-amber-[0-9]+\/[0-9]+|border-amber-[0-9]+|dark:bg-amber-[0-9]+\/[0-9]+|dark:text-amber-[0-9]+|dark:border-amber-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/bg-orange-[0-9]+\/[0-9]+|bg-orange-[0-9]+|text-orange-[0-9]+|border-orange-[0-9]+\/[0-9]+|border-orange-[0-9]+|dark:bg-orange-[0-9]+\/[0-9]+|dark:text-orange-[0-9]+|dark:border-orange-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/bg-cyan-[0-9]+\/[0-9]+|bg-cyan-[0-9]+|text-cyan-[0-9]+|border-cyan-[0-9]+\/[0-9]+|border-cyan-[0-9]+|dark:bg-cyan-[0-9]+\/[0-9]+|dark:text-cyan-[0-9]+|dark:border-cyan-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/bg-indigo-[0-9]+\/[0-9]+|bg-indigo-[0-9]+|text-indigo-[0-9]+|border-indigo-[0-9]+\/[0-9]+|border-indigo-[0-9]+|dark:bg-indigo-[0-9]+\/[0-9]+|dark:text-indigo-[0-9]+|dark:border-indigo-[0-9]+\/[0-9]+/g, '');
  
  // Now add the style tags dynamically
  fs.writeFileSync(file, content);
}
patchComponent('src/components/VocabList.tsx');
patchComponent('src/components/IntensiveStudy.tsx');
patchComponent('src/components/Dashboard.tsx');

