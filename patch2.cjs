const fs = require('fs');
const content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const target = `{renderHighlight(ex.sentence, word.word)}
                                  </p>`;
const replacement = `{renderHighlight(ex.sentence, word.word)}
                                    <button
                                      onClick={(e) => playAudio(e, ex.sentence)}
                                      className="inline-flex items-center justify-center p-2 ml-3 text-theme-primary/40 hover:text-theme-accent transition-colors align-middle rounded-full hover:bg-theme-accent/10"
                                      title="Nghe câu ví dụ"
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                  </p>`;

if (content.includes(target)) {
  fs.writeFileSync('src/components/IntensiveStudy.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
