const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

const oldMap = `
              <div className="flex flex-col gap-4">
                {forms.map((f, index) => (
                  <div key={index} className="relative flex gap-4">
                    <input 
                      type="text" 
                      value={f.name}
                      onChange={e => {
                        const newForms = [...forms];
                        newForms[index].name = e.target.value;
                        setForms(newForms);
                      }}
                      className="w-1/3 px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
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
                      className="flex-1 px-4 py-2 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
                      placeholder={formsValuePlaceholder}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newForms = [...forms];
                        newForms.splice(index, 1);
                        setForms(newForms);
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[120%] p-1.5 text-theme-primary/40 hover:text-red-500 transition-colors"
                      title="Xóa thể"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
`;

// wait, let's use a regex or just read the file and replace a bigger block.
