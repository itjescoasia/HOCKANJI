const fs = require('fs');

let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const oldCardPattern = /<Draggable[\s\S]*?key=\{word\.id\}[\s\S]*?>\s*\{\(provided, snapshot\) => \(\s*<motion\.div\s*ref=\{provided\.innerRef\}[\s\S]*?className=\{`group bg-theme-panel border \$\{snapshot\.isDragging \? 'border-theme-accent shadow-lg z-50' : 'border-theme-subtle hover:border-theme-accent'\} p-6 transition-all cursor-pointer relative`\}\s*onClick=\{\(\) => \{\s*setSelectedWordId\(word\.id\);\s*setViewState\("study"\);\s*\}\}\s*>/;

const newCard = `<Draggable
                            key={word.id}
                            draggableId={word.id}
                            index={index}
                            isDragDisabled={!!searchQuery.trim()}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={provided.draggableProps.style}
                                className={\`h-full \${snapshot.isDragging ? "z-50" : "z-0"}\`}
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className={\`group bg-theme-panel border \${snapshot.isDragging ? 'border-theme-accent shadow-2xl ring-2 ring-theme-accent/20 scale-105' : 'border-theme-subtle hover:border-theme-accent hover:shadow-xl hover:-translate-y-1 hover:shadow-theme-accent/10'} p-6 transition-all duration-300 ease-out cursor-pointer relative h-full flex flex-col overflow-hidden\`}
                                  onClick={() => {
                                    setSelectedWordId(word.id);
                                    setViewState("study");
                                  }}
                                >
                                  {/* Beautiful background accent */}
                                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-theme-accent/5 rounded-full blur-2xl group-hover:bg-theme-accent/10 transition-colors duration-500 pointer-events-none"></div>
`;

content = content.replace(/<Draggable\s+key=\{word\.id\}\s+draggableId=\{word\.id\}\s+index=\{index\}\s+isDragDisabled=\{!!searchQuery\.trim\(\)\}\s*>\s*\{\(provided, snapshot\) => \(\s*<motion\.div\s+ref=\{provided\.innerRef\}\s+\{\.\.\.provided\.draggableProps\}\s+initial=\{\{ opacity: 0, y: 10 \}\}\s+animate=\{\{ opacity: 1, y: 0 \}\}\s+exit=\{\{ opacity: 0, scale: 0\.95 \}\}\s+className=\{`group bg-theme-panel border \$\{snapshot\.isDragging \? 'border-theme-accent shadow-lg z-50' : 'border-theme-subtle hover:border-theme-accent'\} p-6 transition-all cursor-pointer relative`\}\s+onClick=\{\(\) => \{\s+setSelectedWordId\(word\.id\);\s+setViewState\("study"\);\s+\}\}\s*>/, newCard);

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
