const fs = require('fs');
let code = fs.readFileSync('src/components/ShortStudySession.tsx', 'utf8');

const searchStr = `  const [queue, setQueue] = useState<KanjiCard[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);`;

const replaceStr = `  const [queue, setQueue] = useState<KanjiCard[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    const handleTTSGenerated = (e: any) => {
      const { text, audioUrl } = e.detail;
      if (!text || !audioUrl) return;
      
      setQueue(prev => prev.map(card => {
        let updated = false;
        const newCard = { ...card };
        
        if (newCard.examples) {
          newCard.examples = newCard.examples.map(ex => {
            if (ex.sentence === text && ex.audioUrl !== audioUrl) {
              updated = true;
              return { ...ex, audioUrl, hasAudio: true };
            }
            return ex;
          });
        }
        
        if (newCard.forms) {
          newCard.forms = newCard.forms.map(form => {
            if (form.value === text && form.audioUrl !== audioUrl) {
              updated = true;
              return { ...form, audioUrl, hasAudio: true };
            }
            return form;
          });
        }
        
        return updated ? newCard : card;
      }));
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, []);`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/ShortStudySession.tsx', code);
  console.log("Patched ShortStudySession successfully.");
} else {
  console.log("String not found in ShortStudySession");
}
