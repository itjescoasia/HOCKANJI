const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const hasAudioStr = "matchedForm?.audioUrl || card.audioUrl";

code = code.replace(
  /<button \n\s*onClick=\{\(e\) => playAudio\(e, text, matchedForm\?\.audioUrl \|\| card\.audioUrl\)\}\n\s*className="p-2 rounded-full text-theme-primary\/40 hover:text-theme-accent hover:bg-theme-accent\/10 transition-colors shrink-0"\n\s*title="Nghe phát âm"\n\s*>\n\s*<Volume2 className="w-4 h-4" \/>\n\s*<\/button>/g,
  `<div className="flex flex-col items-center gap-0.5">
    <button 
      onClick={(e) => playAudio(e, text, ${hasAudioStr})}
      className={\`p-2 rounded-full transition-colors shrink-0 \${(${hasAudioStr}) ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10'}\`}
      title={(${hasAudioStr}) ? "Nghe file âm thanh MP3" : "Nghe phát âm"}
    >
      <Volume2 className="w-4 h-4" />
    </button>
    {(${hasAudioStr}) && <span className="text-[7px] font-bold text-theme-accent uppercase leading-none tracking-widest -mt-1">MP3</span>}
  </div>`
);

fs.writeFileSync('src/utils/highlight.tsx', code);
