const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const replacement = `
              <div className="flex gap-3 items-start">
                  {((viewingCard.forms && viewingCard.forms.length > 0) || (viewingCard.examples && viewingCard.examples.length > 0)) && (
                     <button 
                       onClick={handleBulkGenerateAudio}
                       disabled={isBulkGenerating}
                       className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-theme-accent bg-theme-accent/10 border border-theme-accent/20 hover:bg-theme-accent/20 rounded-md transition-colors disabled:opacity-50"
                       title="Tự động tạo và tải lên Cloud MP3 cho tất cả các Thể và Ví dụ chưa có âm thanh"
                     >
                       {isBulkGenerating ? (
                         <span className="flex items-center gap-1">
                           <div className="w-3 h-3 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                           Đang xử lý...
                         </span>
                       ) : (
                         <span className="flex items-center gap-1">
                           <Volume2 className="w-3.5 h-3.5" />
                           Tải MP3 hàng loạt
                         </span>
                       )}
                     </button>
                  )}
                  <button 
                    onClick={() => setViewingCard(null)}
                    className="p-2 text-theme-primary/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
              </div>
`;

// Looking for the close button:
const target = `              <button 
                onClick={() => setViewingCard(null)}
                className="p-2 text-theme-primary/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>`;
              
code = code.replace(target, replacement);

fs.writeFileSync('src/components/VocabList.tsx', code);
