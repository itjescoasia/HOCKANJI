const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Inside table row for kanji
code = code.replace(
  /<button\s+onClick=\{\(e\) => playAudio\(e, card\.kanji \|\| card\.reading, card\.audioUrl\)\}\s+className="p-1\.5 text-theme-primary\/40 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors opacity-100"\s+title="Nghe phát âm"\s*>\s*<Volume2 className="w-4 h-4" \/>\s*<\/button>/g,
  `<div className="flex flex-col items-center gap-0.5">
    <button
      onClick={(e) => playAudio(e, card.kanji || card.reading, card.audioUrl)}
      className={\`p-1.5 rounded-full transition-colors opacity-100 \${card.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'}\`}
      title={card.audioUrl ? "Nghe file âm thanh MP3" : "Nghe phát âm"}
    >
      <Volume2 className="w-4 h-4" />
    </button>
    {card.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
  </div>`
);

// Also do the same in the viewingCard (modal)
code = code.replace(
  /<button\s+onClick=\{\(e\) => playAudio\(e, viewingCard\.kanji \|\| viewingCard\.reading, viewingCard\.audioUrl\)\}\s+className="p-2\.5 text-theme-primary\/40 hover:text-theme-accent bg-theme-panel\/80 hover:bg-theme-panel rounded-full transition-colors opacity-100 shadow-sm"\s+title="Nghe phát âm"\s*>\s*<Volume2 className="w-6 h-6" \/>\s*<\/button>/g,
  `<div className="flex flex-col items-center gap-1 absolute top-8 sm:top-10 right-8 sm:right-10">
    <button
      onClick={(e) => playAudio(e, viewingCard.kanji || viewingCard.reading, viewingCard.audioUrl)}
      className={\`p-2.5 rounded-full transition-colors opacity-100 shadow-sm \${viewingCard.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent bg-theme-panel/80 hover:bg-theme-panel'}\`}
      title={viewingCard.audioUrl ? "Nghe file âm thanh MP3" : "Nghe phát âm"}
    >
      <Volume2 className="w-6 h-6" />
    </button>
    {viewingCard.audioUrl && <span className="text-[9px] font-bold text-theme-accent uppercase tracking-widest">MP3</span>}
  </div>`
);

fs.writeFileSync('src/components/VocabList.tsx', code);
