const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetLogic = `                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden">`;

const newLogic = `                                )}
                              </div>
                            </div>
                            
                            {/* BULK AUDIO BUTTON IN EDIT MODE */}
                            {((editForm.forms && editForm.forms.length > 0) || (editForm.examples && editForm.examples.length > 0)) && (
                               <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-theme-subtle items-end">
                                 {(() => {
                                    const hasMissingMp3s = (editForm.forms?.some(f => f.value && !f.audioUrl)) || (editForm.examples?.some(ex => ex.sentence && !ex.audioUrl));
                                    
                                    if (!hasMissingMp3s && !isBulkGenerating) {
                                       return (
                                         <button
                                            disabled
                                           className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-green-500 bg-green-500/10 border border-green-500/20 rounded-md transition-colors min-w-[140px] justify-center cursor-default"
                                           title="Tất cả các thể và câu ví dụ đều đã có MP3 trên Cloud"
                                         >
                                           <span className="flex items-center gap-1">
                                             <Check className="w-3 h-3" />
                                             Đã đủ MP3
                                           </span>
                                         </button>
                                       );
                                    }
                                    return (
                                       <button
                                          onClick={handleEditBulkGenerateAudio}
                                         disabled={isBulkGenerating}
                                         className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-theme-accent bg-theme-accent/10 border border-theme-accent/20 hover:bg-theme-accent/20 rounded-md transition-colors disabled:opacity-50 min-w-[140px] justify-center"
                                         title="Tự động tạo và tải lên Cloud MP3 cho tất cả các Thể và Ví dụ chưa có âm thanh"
                                       >
                                         {isBulkGenerating ? (
                                           <span className="flex items-center gap-1.5">
                                             <div className="w-3 h-3 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                                             {bulkProgress ? \`\${bulkProgress.current}/\${bulkProgress.total}\` : 'Đang xử lý...'}
                                           </span>
                                         ) : (
                                           <span className="flex items-center gap-1">
                                             <Volume2 className="w-3 h-3" />
                                             Tải MP3 hàng loạt
                                           </span>
                                         )}
                                       </button>
                                    );
                                 })()}
                                 {isBulkGenerating && bulkProgress && (
                                   <div className="w-full max-w-[140px] bg-theme-accent/10 rounded-full h-1 overflow-hidden relative">
                                      <div 
                                        className="bg-theme-accent h-1 transition-all duration-300 absolute left-0 top-0 bottom-0" 
                                        style={{ width: \`\${(bulkProgress.current / bulkProgress.total) * 100}%\` }}
                                      ></div>
                                   </div>
                                 )}
                               </div>
                            )}

                          </div>
                        </td>
                        <td className="hidden">`;

code = code.replace(targetLogic, newLogic);
fs.writeFileSync('src/components/VocabList.tsx', code);
