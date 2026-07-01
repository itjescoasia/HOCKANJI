const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf-8');

const target = `          {showAnswer ? (
            <div className="flex-1 flex gap-4 max-w-[400px]">
              <button
                onClick={() => handleGrade(false)}
                className="flex-1 border border-red-500/50 text-red-500 bg-theme-panel hover:bg-red-500/10 font-bold py-4 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                {mode === "VI_TO_JA" ? "Chưa nói được" : "Chưa nhớ"}
              </button>
              <button
                onClick={() => handleGrade(true)}
                className="flex-1 border border-green-500 text-green-500 bg-theme-panel hover:bg-green-500/10 font-bold py-4 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                {mode === "VI_TO_JA" ? "Nói được" : "Đã nhớ"}
              </button>
            </div>`;

const replacement = `          {showAnswer ? (
            <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 max-w-[500px]">
              <button
                onClick={() => handleGrade('forgot')}
                className="border border-red-500/50 text-red-500 bg-theme-panel hover:bg-red-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1"
              >
                <span className="uppercase tracking-widest text-[9px] opacity-70">{mode === "VI_TO_JA" ? "Quên sạch" : "Quên sạch"}</span>
                <span className="text-xs">Lại từ đầu</span>
              </button>
              <button
                onClick={() => handleGrade('hard')}
                className="border border-orange-500/50 text-orange-500 bg-theme-panel hover:bg-orange-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1"
              >
                <span className="uppercase tracking-widest text-[9px] opacity-70">{mode === "VI_TO_JA" ? "Đã học" : "Đã học"}</span>
                <span className="text-xs">{mode === "VI_TO_JA" ? "Chưa nói được" : "Chưa nhớ"}</span>
              </button>
              <button
                onClick={() => handleGrade('good')}
                className="border border-green-500 text-green-500 bg-theme-panel hover:bg-green-500/10 font-bold py-3 sm:py-4 transition-colors flex flex-col items-center gap-1"
              >
                <span className="uppercase tracking-widest text-[9px] opacity-70">{mode === "VI_TO_JA" ? "Trôi chảy" : "Ghi nhớ"}</span>
                <span className="text-xs">{mode === "VI_TO_JA" ? "Nói được" : "Đã nhớ"}</span>
              </button>
            </div>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/SentenceReview.tsx', code, 'utf-8');
    console.log("Replaced buttons");
} else {
    console.log("Could not find buttons");
}
