const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const matchOldGridInfo = `                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-theme-primary/40 group-hover:text-theme-accent/60 transition-colors flex items-center gap-1.5">
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      {word.examples.length} CÂU
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-theme-primary/40 flex items-center gap-1 border-l border-theme-subtle pl-3">
                                      Thành thạo: <span className={(word.reviewScore || 0) > 0 ? "text-green-500" : (word.reviewScore || 0) < 0 ? "text-red-500" : "text-theme-accent"}>{word.reviewScore || 0}</span>
                                    </span>
                                  </div>`;

const newGridInfo = `                                  <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-theme-primary/40 group-hover:text-theme-accent/60 transition-colors flex items-center gap-1.5 shrink-0">
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      {word.examples.length} CÂU
                                    </span>
                                    {(() => {
                                      const targetScore = Math.max(1, word.examples.length * 3);
                                      const percent = Math.max(0, Math.min(100, Math.round(((word.reviewScore || 0) / targetScore) * 100)));
                                      let colorClass = "text-theme-accent bg-theme-accent";
                                      if (percent >= 80) colorClass = "text-green-500 bg-green-500";
                                      else if (percent >= 40) colorClass = "text-orange-500 bg-orange-500";
                                      
                                      return (
                                        <div className="flex flex-col gap-1.5 w-24 border-l border-theme-subtle pl-4">
                                          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold">
                                            <span className="text-theme-primary/40">Thành thạo</span>
                                            <span className={colorClass.split(' ')[0]}>{percent}%</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-theme-subtle rounded-full overflow-hidden">
                                            <div className={\`h-full rounded-full transition-all duration-500 \${colorClass.split(' ')[1]}\`} style={{ width: \`\${percent}%\` }} />
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>`;

content = content.replace(matchOldGridInfo, newGridInfo);


const matchOldDetailInfo = `            <span className="flex items-center gap-3">
              <span>{word.examples.length} câu ví dụ</span>
              <span className="border-l border-theme-subtle pl-3">
                Thành thạo: <span className={(word.reviewScore || 0) > 0 ? "text-green-500 font-bold" : (word.reviewScore || 0) < 0 ? "text-red-500 font-bold" : "text-theme-accent font-bold"}>{word.reviewScore || 0}</span>
              </span>
            </span>`;

const newDetailInfo = `            <span className="flex items-center gap-4">
              <span>{word.examples.length} câu ví dụ</span>
              {(() => {
                const targetScore = Math.max(1, word.examples.length * 3);
                const percent = Math.max(0, Math.min(100, Math.round(((word.reviewScore || 0) / targetScore) * 100)));
                let colorClass = "text-theme-accent bg-theme-accent";
                if (percent >= 80) colorClass = "text-green-500 bg-green-500";
                else if (percent >= 40) colorClass = "text-orange-500 bg-orange-500";
                
                return (
                  <div className="flex items-center gap-3 border-l border-theme-subtle pl-4">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-theme-primary/40">
                      Thành thạo
                    </div>
                    <div className="w-32 h-2 bg-theme-subtle rounded-full overflow-hidden relative">
                      <div className={\`absolute top-0 left-0 h-full rounded-full transition-all duration-500 \${colorClass.split(' ')[1]}\`} style={{ width: \`\${percent}%\` }} />
                    </div>
                    <span className={\`text-xs font-bold \${colorClass.split(' ')[0]}\`}>{percent}%</span>
                  </div>
                );
              })()}
            </span>`;

content = content.replace(matchOldDetailInfo, newDetailInfo);

fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
console.log("Patched IntensiveStudy.tsx");
