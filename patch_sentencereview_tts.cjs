const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const searchStr = `  const [editData, setEditData] = useState({
    sentence: "",
    reading: "",
    romaji: "",
    translation: "",
  });`;

const replaceStr = `  const [editData, setEditData] = useState({
    sentence: "",
    reading: "",
    romaji: "",
    translation: "",
  });

  useEffect(() => {
    const handleTTSGenerated = (e: any) => {
      const { text, audioUrl } = e.detail;
      if (!text || !audioUrl) return;
      
      setExamples(prev => prev.map(ex => {
        if (ex.sentence === text && ex.audioUrl !== audioUrl) {
          return { ...ex, audioUrl, hasAudio: true };
        }
        return ex;
      }));
    };
    
    window.addEventListener('tts-generated', handleTTSGenerated);
    return () => window.removeEventListener('tts-generated', handleTTSGenerated);
  }, []);`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/SentenceReview.tsx', code);
  console.log("Patched SentenceReview successfully.");
} else {
  console.log("String not found in SentenceReview");
}
