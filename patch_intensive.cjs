const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<p className="text-theme-primary font-serif text-base">{ex.sentence}</p>
                                              {ex.reading && <p className="text-theme-primary/40 text-xs mt-0.5">{ex.reading}</p>}
                                              <p className="text-theme-primary/60 text-sm mt-1">{ex.translation}</p>`;
const replacement = `<p className="text-theme-primary font-serif text-base">{ex.sentence}</p>
                                              {(ex.reading || ex.romaji) && (
                                                <p className="text-theme-primary/40 text-xs mt-0.5">
                                                  {ex.reading} {ex.reading && ex.romaji && '•'} {ex.romaji}
                                                </p>
                                              )}
                                              <p className="text-theme-primary/60 text-sm mt-1">{ex.translation}</p>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched IntensiveStudy.tsx successfully");
} else {
  console.log("Target not found!");
}
