const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

code = code.replace(
  /<button\s+onClick=\{\(e\) => playAudio\(e, viewingCard\.kanji \|\| viewingCard\.reading, viewingCard\.audioUrl\)\}\s+className="p-2 bg-theme-accent\/10 text-theme-accent rounded-full hover:bg-theme-accent hover:text-theme-inverted transition-colors"\s+title="Nghe phát âm"\s*>\s*<Volume2 className="w-5 h-5" \/>\s*<\/button>/g,
  `<div className="flex flex-col items-center gap-0.5">
    <button
      onClick={(e) => playAudio(e, viewingCard.kanji || viewingCard.reading, viewingCard.audioUrl)}
      className="p-2 bg-theme-accent/10 text-theme-accent rounded-full hover:bg-theme-accent hover:text-theme-inverted transition-colors"
      title={viewingCard.audioUrl ? "Nghe file âm thanh MP3" : "Nghe phát âm"}
    >
      <Volume2 className="w-5 h-5" />
    </button>
    {viewingCard.audioUrl && <span className="text-[9px] font-bold text-theme-accent uppercase tracking-widest mt-1">MP3</span>}
  </div>`
);

fs.writeFileSync('src/components/VocabList.tsx', code);
