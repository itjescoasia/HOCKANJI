const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

const regex = /<div className="flex flex-col gap-4">\s*\{forms\.map\(\(f, index\) => \([\s\S]*?<\/div>\s*\)\)\}\s*<\/div>/;

const newMap = `
              <div className="flex flex-col gap-4">
                {forms.map((f, index) => (
                  <div key={index} className="relative flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 border border-theme-subtle/50 rounded-lg bg-theme-panel/30">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={f.name}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].name = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm font-bold"
                        placeholder={formsNamePlaceholder}
                      />
                      <input 
                        type="text" 
                        value={f.value}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].value = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                        placeholder={formsValuePlaceholder}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={f.reading || ''}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].reading = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                        placeholder="Phát âm (Hiragana)"
                      />
                      <input 
                        type="text" 
                        value={f.romaji || ''}
                        onChange={e => {
                          const newForms = [...forms];
                          newForms[index].romaji = e.target.value;
                          setForms(newForms);
                        }}
                        className="w-full px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                        placeholder="Phát âm (Romaji)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newForms = [...forms];
                        newForms.splice(index, 1);
                        setForms(newForms);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-theme-panel text-theme-primary/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Xóa thể"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
`;

code = code.replace(regex, newMap.trim());
fs.writeFileSync('src/components/AddVocab.tsx', code);
