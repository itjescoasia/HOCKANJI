const fs = require('fs');

const updateFile = (path) => {
    let code = fs.readFileSync(path, 'utf8');
    
    // For VocabList.tsx and AddVocab.tsx
    const target = `      if (url) {
        onComplete(url);
      } else {`;
      
    const repl = `      if (url) {
        onComplete(url);
        const audio = new Audio(url);
        audio.play().catch(console.error);
      } else {`;
      
    code = code.replace(target, repl);
    fs.writeFileSync(path, code);
};

updateFile('src/components/VocabList.tsx');
updateFile('src/components/AddVocab.tsx');

// For IntensiveStudy.tsx
let intCode = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
const intTarget = `                        if (url) {
                            onUpdateExample(example.id, { audioUrl: url, hasAudio: true });
                            setAudioUrl(url);
                        } else {`;
const intRepl = `                        if (url) {
                            onUpdateExample(example.id, { audioUrl: url, hasAudio: true });
                            setAudioUrl(url);
                            const audio = new Audio(url);
                            audio.play().catch(console.error);
                        } else {`;
intCode = intCode.replace(intTarget, intRepl);
fs.writeFileSync('src/components/IntensiveStudy.tsx', intCode);

