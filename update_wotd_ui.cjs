const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const newBlock = `      {/* Sentence of the Day */}
      {sentenceOfTheDay && (
        <div className="bg-theme-panel border border-theme-accent p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none hidden sm:block">
            <span className="text-8xl font-serif whitespace-nowrap max-w-full overflow-hidden text-ellipsis block">
              {sentenceOfTheDay.word.word}
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <h2 className="text-[10px] uppercase tracking-widest text-theme-accent mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-theme-accent rounded-full inline-block"></span>
                  Mỗi ngày 1 câu
                </h2>
                
                <div className="flex items-start gap-2 mt-4">
                  <p className="text-xl sm:text-2xl text-theme-primary leading-relaxed font-serif">
                    {renderExampleHighlight(
                      sentenceOfTheDay.example.sentence,
                      sentenceOfTheDay.word.word,
                      deck,
                    )}
                  </p>
                  <button
                    onClick={(e) => playAudio(e, sentenceOfTheDay.example.sentence)}
                    className="p-1.5 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 mt-1"
                    title="Nghe câu"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-3 mt-2">
                  {sentenceOfTheDay.example.reading && (
                    <span className="text-sm text-theme-primary opacity-70 italic">
                      {sentenceOfTheDay.example.reading}
                    </span>
                  )}
                  {sentenceOfTheDay.example.romaji && (
                    <span className="text-sm text-theme-primary opacity-50 font-serif italic">
                      {sentenceOfTheDay.example.romaji}
                    </span>
                  )}
                </div>
                <p className="text-sm text-theme-primary/60 mt-2 uppercase tracking-wider">
                  {sentenceOfTheDay.example.translation}
                </p>

                <div className="mt-6 border-t border-theme-subtle pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-serif text-theme-primary">
                      {sentenceOfTheDay.word.word}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                    {sentenceOfTheDay.word.reading && (
                      <span className="text-sm text-theme-primary opacity-80">
                        {sentenceOfTheDay.word.reading}
                      </span>
                    )}
                    {sentenceOfTheDay.word.romaji && (
                      <span className="text-xs text-theme-primary opacity-60 font-serif italic">
                        {sentenceOfTheDay.word.romaji}
                      </span>
                    )}
                  </div>
                  {sentenceOfTheDay.word.category && (
                    <span className="text-[10px] uppercase border border-theme-accent/40 text-theme-accent px-2 py-0.5 rounded opacity-80 self-start sm:self-auto mt-1 sm:mt-0">
                      {sentenceOfTheDay.word.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-theme-primary opacity-90 max-w-2xl mt-2">
                  {sentenceOfTheDay.word.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}`;

const startIndex = code.indexOf('{/* Word of the Day */}');
if (startIndex !== -1) {
  const endMarker = '      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">';
  const endIndex = code.indexOf(endMarker, startIndex);
  if (endIndex !== -1) {
    code = code.slice(0, startIndex) + newBlock + '\n\n' + code.slice(endIndex);
    fs.writeFileSync('src/components/Dashboard.tsx', code);
    console.log('UI updated successfully');
  } else {
    console.log('End marker not found');
  }
} else {
  console.log('Start marker not found');
}
