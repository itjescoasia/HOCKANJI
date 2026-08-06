const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const targetButtons = `<span className="flex items-center gap-1 -mt-1 -mr-1">
                  <button 
                    onClick={(e) => playAudio(e, text)}`;

const newButtons = `<span className="flex items-center gap-1 -mt-1 -mr-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="p-2 rounded-full text-theme-primary/40 hover:text-theme-primary hover:bg-theme-subtle/30 transition-colors shrink-0"
                    title="Đóng"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <button 
                    onClick={(e) => playAudio(e, text)}`;

content = content.replace(targetButtons, newButtons);
fs.writeFileSync('src/utils/highlight.tsx', content);
console.log("Patched tooltip close button");
