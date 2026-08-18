const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = `<button
                                    onClick={(e) => playAudio(e, ex.sentence)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title="Phát âm thanh"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>`;
const replacement1 = `{!ex.hasAudio && !ex.audioUrl && (
                                  <button
                                    onClick={(e) => playAudio(e, ex.sentence)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title="Phát âm thanh"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                  )}`;

const target2 = `<button
                                      onClick={(e) => playAudio(e, ex.sentence)}
                                      className="inline-flex items-center justify-center p-2 ml-3 text-theme-primary/40 hover:text-theme-accent transition-colors align-middle rounded-full hover:bg-theme-accent/10"
                                      title="Nghe câu ví dụ"
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>`;

const replacement2 = `{!ex.hasAudio && !ex.audioUrl && (
                                    <button
                                      onClick={(e) => playAudio(e, ex.sentence)}
                                      className="inline-flex items-center justify-center p-2 ml-3 text-theme-primary/40 hover:text-theme-accent transition-colors align-middle rounded-full hover:bg-theme-accent/10"
                                      title="Nghe câu ví dụ"
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                    )}`;

let patched = false;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  patched = true;
} else {
  console.log("target1 not found");
}

if (code.includes(target2)) {
  code = code.replace(target2, replacement2);
  patched = true;
} else {
  console.log("target2 not found");
}

if (patched) {
  fs.writeFileSync(file, code);
  console.log("Patched successfully");
}
