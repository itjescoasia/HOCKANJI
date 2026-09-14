const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const target1 = `  const playAudio = (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
      return;
    }
    if (!text) {
      return;
    }
    playTTS(text);
  };`;

if(!code.includes(target1)) {
    const backupTarget = `  const playAudio = (e: React.MouseEvent, text: string | undefined | null) => {
    e.stopPropagation();
    if (!text) {
      return;
    }
    playTTS(text);
  };`;
    
    if(code.includes(backupTarget)) {
        code = code.replace(backupTarget, `  const playAudio = (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
      return;
    }
    if (!text) {
      return;
    }
    playTTS(text);
  };`);
    }
}


const targetBtn1 = `<button
                                  onClick={(e) => playAudio(e, currentCard.kanji || currentCard.reading)}
                                  className="p-3 bg-theme-panel text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel shadow-sm border border-theme-subtle/50 rounded-full transition-colors relative"
                                  title="Nghe phát âm"
                                >
                                  <Volume2 className="w-6 h-6" />
                                </button>`;
const replBtn1 = `<div className="flex flex-col items-center gap-0.5">
                                <button
                                  onClick={(e) => playAudio(e, currentCard.kanji || currentCard.reading, currentCard.audioUrl)}
                                  className={\`p-3 shadow-sm border border-theme-subtle/50 rounded-full transition-colors relative \${currentCard.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'bg-theme-panel text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel'}\`}
                                  title={currentCard.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
                                >
                                  <Volume2 className="w-6 h-6" />
                                </button>
                                {currentCard.audioUrl && <span className="text-[10px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-1">MP3</span>}
                                </div>`;

code = code.replace(targetBtn1, replBtn1);

fs.writeFileSync('src/components/ReviewSession.tsx', code);
