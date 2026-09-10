const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetUI = `                  {((viewingCard.forms && viewingCard.forms.length > 0) || (viewingCard.examples && viewingCard.examples.length > 0)) && (
                     <div className="flex flex-col gap-1.5 items-end">
                       <button 
                         onClick={handleBulkGenerateAudio}
                         disabled={isBulkGenerating}
                         className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-theme-accent bg-theme-accent/10 border border-theme-accent/20 hover:bg-theme-accent/20 rounded-md transition-colors disabled:opacity-50 min-w-[140px] justify-center"
                         title="Tự động tạo và tải lên Cloud MP3 cho tất cả các Thể và Ví dụ chưa có âm thanh"
                       >
                         {isBulkGenerating ? (
                           <span className="flex items-center gap-1.5">
                             <div className="w-3 h-3 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                             {bulkProgress ? \`\${bulkProgress.current}/\${bulkProgress.total}\` : 'Đang xử lý...'}
                           </span>
                         ) : (
                           <span className="flex items-center gap-1">
                             <Volume2 className="w-3.5 h-3.5" />
                             Tải MP3 hàng loạt
                           </span>
                         )}
                       </button>
                       {isBulkGenerating && bulkProgress && (
                         <div className="w-full bg-theme-accent/10 rounded-full h-1 overflow-hidden relative">
                            <div 
                              className="bg-theme-accent h-1 transition-all duration-300 absolute left-0 top-0 bottom-0" 
                              style={{ width: \`\${(bulkProgress.current / bulkProgress.total) * 100}%\` }}
                            ></div>
                         </div>
                       )}
                     </div>
                  )}`;

const replacementUI = `                  {((viewingCard.forms && viewingCard.forms.length > 0) || (viewingCard.examples && viewingCard.examples.length > 0)) && (
                     <div className="flex flex-col gap-1.5 items-end">
                       {(() => {
                          const hasMissingMp3s = (viewingCard.forms?.some(f => f.value && !f.audioUrl)) || (viewingCard.examples?.some(ex => ex.sentence && !ex.audioUrl));
                          
                          if (!hasMissingMp3s && !isBulkGenerating) {
                             return (
                               <button 
                                 disabled
                                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-500 bg-green-500/10 border border-green-500/20 rounded-md transition-colors min-w-[140px] justify-center cursor-default"
                                 title="Tất cả các thể và câu ví dụ đều đã có MP3 trên Cloud"
                               >
                                 <span className="flex items-center gap-1">
                                   <Check className="w-3.5 h-3.5" />
                                   Đã đủ MP3
                                 </span>
                               </button>
                             );
                          }

                          return (
                             <button 
                               onClick={handleBulkGenerateAudio}
                               disabled={isBulkGenerating}
                               className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-theme-accent bg-theme-accent/10 border border-theme-accent/20 hover:bg-theme-accent/20 rounded-md transition-colors disabled:opacity-50 min-w-[140px] justify-center"
                               title="Tự động tạo và tải lên Cloud MP3 cho tất cả các Thể và Ví dụ chưa có âm thanh"
                             >
                               {isBulkGenerating ? (
                                 <span className="flex items-center gap-1.5">
                                   <div className="w-3 h-3 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                                   {bulkProgress ? \`\${bulkProgress.current}/\${bulkProgress.total}\` : 'Đang xử lý...'}
                                 </span>
                               ) : (
                                 <span className="flex items-center gap-1">
                                   <Volume2 className="w-3.5 h-3.5" />
                                   Tải MP3 hàng loạt
                                 </span>
                               )}
                             </button>
                          );
                       })()}
                       {isBulkGenerating && bulkProgress && (
                         <div className="w-full bg-theme-accent/10 rounded-full h-1 overflow-hidden relative">
                            <div 
                              className="bg-theme-accent h-1 transition-all duration-300 absolute left-0 top-0 bottom-0" 
                              style={{ width: \`\${(bulkProgress.current / bulkProgress.total) * 100}%\` }}
                            ></div>
                         </div>
                       )}
                     </div>
                  )}`;

code = code.replace(targetUI, replacementUI);

fs.writeFileSync('src/components/VocabList.tsx', code);
