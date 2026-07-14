const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

// The file is currently mangled. I need to restore it from git or fix it.
// Oh wait, I don't have git. Let's just fix the structure manually.

// I'll search for the whole chunk and replace it.
const startIndex = code.indexOf('<div className="w-full relative" style={{ perspective: "1000px" }}>');
const endIndex = code.indexOf('{showAnswer ? (', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newStructure = `
  <div className="w-full relative" style={{ perspective: "1000px" }}>
    <motion.div
      className="w-full relative"
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateY: showAnswer ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 20 }}
    >
      {/* Front */}
      <div 
        className={\`bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative group \${showAnswer ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}\`}
        style={{ backfaceVisibility: "hidden" }}
      >
        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "NHẬT" : "VIỆT"}
        </span>
        
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="absolute top-4 right-4 text-theme-primary/40 hover:text-theme-accent transition-colors p-2"
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
        ) : (
          <HighlightProvider>
            <div className="mb-8 mt-4">
              <p
                className={\`font-serif leading-relaxed whitespace-pre-wrap \${mode === "JA_TO_VI" ? "text-theme-japanese text-2xl sm:text-3xl" : "text-theme-primary text-xl sm:text-2xl"}\`}
              >
                {mode === "JA_TO_VI"
                  ? renderExampleHighlight(
                      currentExample.sentence,
                      currentExample.word,
                      mainDeck,
                    )
                  : <HighlightVietnamese text={questionText} />}
              </p>
              {mode === "JA_TO_VI" && currentExample.reading && (
                <p className="text-theme-accent opacity-80 mt-4 text-sm">
                  <RelatedHighlight text={currentExample.reading} type="hiragana" />
                </p>
              )}
            </div>
          </HighlightProvider>
        )}
      </div>

      {/* Back */}
      <div 
        className={\`bg-theme-panel border border-theme-subtle p-8 sm:p-12 flex flex-col items-center text-center relative group \${!showAnswer ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}\`}
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <span className="absolute top-4 left-4 text-xs font-mono text-theme-accent/30">
          {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
        </span>
        <HighlightProvider>
          <div className="w-full flex flex-col items-center justify-center min-h-[150px]">
            <span className="text-xs font-mono text-theme-accent/30 mb-4 block uppercase">
              {mode === "JA_TO_VI" ? "VIỆT" : "NHẬT"}
            </span>
            <p
              className={\`font-serif leading-relaxed whitespace-pre-wrap \${mode === "VI_TO_JA" ? "text-theme-japanese text-2xl sm:text-3xl" : "text-theme-accent text-xl sm:text-2xl"}\`}
            >
              {mode === "VI_TO_JA"
                ? renderExampleHighlight(
                    currentExample.sentence,
                    currentExample.word,
                    mainDeck,
                  )
                : <HighlightVietnamese text={answerText} />}
            </p>
            {mode === "VI_TO_JA" && currentExample.reading && (
              <p className="text-theme-primary/60 mt-4 text-sm">
                <RelatedHighlight text={currentExample.reading} type="hiragana" />
              </p>
            )}
            {currentExample.romaji && (
              <p className="text-theme-primary/40 mt-2 text-xs">
                <RelatedHighlight text={currentExample.romaji} type="romaji" />
              </p>
            )}
            {currentExample.specialNote && (
              <div className="mt-6 mx-auto max-w-lg p-5 bg-theme-accent/5 border-l-4 border-theme-accent rounded-r-lg relative text-left w-full">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lightbulb className="w-12 h-12 text-theme-accent" />
                </div>
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <Lightbulb className="w-4 h-4 text-theme-accent" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                    Lưu ý đặc biệt
                  </h4>
                </div>
                <div className="relative z-10 text-[15px] text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                  {currentExample.specialNote}
                </div>
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-theme-subtle/50 text-xs text-theme-primary/40 flex gap-2 items-center justify-center w-full">
              <span>Từ vựng gốc:</span>
              <strong className="text-theme-primary/70 font-serif text-sm">
                {currentExample.word}
              </strong>
              {(() => {
                const isMastered =
                  mode === "VI_TO_JA"
                    ? currentExample.viToJaMastered
                    : currentExample.jaToViMastered;
                const finalIsMastered =
                  isMastered !== undefined
                    ? isMastered
                    : currentExample.mastered;

                if (finalIsMastered !== undefined) {
                  return (
                    <span
                      className={\`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold \${finalIsMastered ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}\`}
                    >
                      {finalIsMastered
                        ? mode === "VI_TO_JA"
                          ? "Nói được"
                          : "Đã nhớ"
                        : mode === "VI_TO_JA"
                          ? "Chưa nói được"
                          : "Chưa nhớ"}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </HighlightProvider>
      </div>
    </motion.div>
  </div>
          `;

  code = code.substring(0, startIndex) + newStructure + code.substring(endIndex);
  fs.writeFileSync('src/components/SentenceReview.tsx', code);
} else {
  console.log("Could not find start or end index");
}
