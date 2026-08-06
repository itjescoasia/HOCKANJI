const fs = require('fs');
let content = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const targetBack = `        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
        </span>
        
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
            className="absolute top-4 right-4 text-theme-primary/40 hover:text-theme-accent transition-colors p-2 z-[100]"
            title="Sửa ví dụ"
          >
            <Pen className="w-4 h-4" />
          </button>
        )}`;

const newBack = `        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
        </span>
        
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
            className="absolute top-4 right-4 text-theme-primary/40 hover:text-theme-accent transition-colors p-2 z-[100]"
            title="Sửa ví dụ"
          >
            <Pen className="w-4 h-4" />
          </button>
        )}
        
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="w-full text-left space-y-4 mt-8">
            <h4 className="text-xs uppercase tracking-wider text-theme-accent mb-4 font-medium">Chỉnh sửa câu ví dụ</h4>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Câu ví dụ (Nhật) *</label>
              <textarea required rows={2} value={editData.sentence} onChange={(e) => setEditData({ ...editData, sentence: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent text-theme-japanese font-serif resize-none" placeholder="Nhập câu tiếng Nhật..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Cách đọc (Hiragana)</label>
                <input type="text" value={editData.reading} onChange={(e) => setEditData({ ...editData, reading: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent" placeholder="VD: わたし..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Romaji</label>
                <input type="text" value={editData.romaji} onChange={(e) => setEditData({ ...editData, romaji: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent font-mono" placeholder="VD: watashi..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">Nghĩa tiếng Việt</label>
              <textarea rows={2} value={editData.translation} onChange={(e) => setEditData({ ...editData, translation: e.target.value })} className="w-full bg-theme-base border border-theme-subtle rounded p-3 text-sm focus:outline-none focus:border-theme-accent resize-none" placeholder="Nhập nghĩa tiếng Việt..." />
            </div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={handleCancelEdit} className="flex-1 px-4 py-3 text-xs tracking-widest uppercase font-bold border border-theme-subtle text-theme-primary/60 hover:bg-theme-subtle/50 transition-colors">Hủy</button>
              <button type="submit" className="flex-1 px-4 py-3 text-xs tracking-widest uppercase font-bold bg-theme-accent text-theme-inverted hover:bg-theme-accent-hover transition-colors">Lưu thay đổi</button>
            </div>
          </form>
        ) : (`;

const targetBackEnd = `            </div>
          </div>
        </HighlightProvider> <div className="flex-1 shrink-0 min-h-0" /> </>
      </div>
    </motion.div>`;

const newBackEnd = `            </div>
          </div>
        </HighlightProvider> <div className="flex-1 shrink-0 min-h-0" /> </>
        )}
      </div>
    </motion.div>`;

content = content.replace(targetBack, newBack);
content = content.replace(targetBackEnd, newBackEnd);

fs.writeFileSync('src/components/SentenceReview.tsx', content);
console.log("Patched back side edit form");
