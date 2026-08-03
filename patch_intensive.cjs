const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const targetStart = `                                    if (textToSearch.includes(cleanQ)) return true;`;
const targetEnd = `                                      {matchedExamples.length > 3 && (`;

if (content.includes(targetStart) && content.includes(targetEnd)) {
  const parts1 = content.split(targetStart);
  const before = parts1[0];
  const afterStart = parts1.slice(1).join(targetStart);
  
  const parts2 = afterStart.split(targetEnd);
  const after = parts2.slice(1).join(targetEnd);
  
  const cleanCode = `                                    if (textToSearch.includes(cleanQ)) return true;
                                    
                                    if (queryWords.length > 0) {
                                      const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
                                      return (matchCount / queryWords.length) >= 0.6;
                                    }
                                    return false;
                                  });
                                  
                                  if (matchedExamples.length === 0) return null;
                                  
                                  const highlightText = (text, highlight) => {
                                    if (!highlight.trim() || !text) return text;
                                    const escapedHighlight = highlight.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
                                    const regex = new RegExp(\`(\${escapedHighlight})\`, 'gi');
                                    const parts = text.split(regex);
                                    return parts.map((part, i) => 
                                      part.toLowerCase() === highlight.trim().toLowerCase() 
                                        ? <mark key={i} className="bg-theme-accent/20 text-theme-accent font-bold px-0.5 rounded-sm">{part}</mark> 
                                        : <span key={i}>{part}</span>
                                    );
                                  };

                                  return (
                                    <div className="mb-4 mt-2 flex flex-col gap-2">
                                      {matchedExamples.slice(0, 3).map((ex, i) => (
                                        <div key={i} className="bg-theme-base p-3 border border-theme-subtle rounded-md text-sm">
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <p className="text-theme-primary font-serif text-base">{highlightText(ex.sentence, searchQuery)}</p>
                                              {(ex.reading || ex.romaji) && (
                                                <p className="text-theme-primary/40 text-xs mt-0.5">
                                                  {highlightText(ex.reading || "", searchQuery)} {(ex.reading && ex.romaji) ? '•' : ''} {highlightText(ex.romaji || "", searchQuery)}
                                                </p>
                                              )}
                                              <p className="text-theme-primary/60 text-sm mt-1">{highlightText(ex.translation || "", searchQuery)}</p>
                                            </div>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const u = new SpeechSynthesisUtterance(ex.sentence);
                                                u.lang = 'ja-JP';
                                                window.speechSynthesis.speak(u);
                                              }}
                                              className="p-1.5 bg-theme-panel text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors shrink-0"
                                              title="Nghe phát âm"
                                            >
                                              <Volume2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
`;
  content = before + cleanCode + targetEnd + after;
  fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
  console.log("Patched correctly!");
} else {
  console.log("Target not found!");
}
