const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(/onNavigateAdd: \(\) => void;/g, "onNavigateAdd?: () => void;");

const btnSearch = `{deck.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-12 relative z-10">
            <p className="text-theme-primary/60 max-w-sm mx-auto mb-2 text-sm">Chưa có từ vựng nào. Hãy bắt đầu bằng việc thêm từ mới.</p>
            <button
              onClick={onNavigateAdd}
              className="bg-theme-accent hover:bg-[#a00000] text-white font-medium py-3 px-10 rounded transition-colors"
            >
              Thêm từ vựng
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center relative z-10">
            <button
              onClick={onNavigateAdd}
              className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
            >
              Thêm từ vựng mới
            </button>`;

const btnReplace = `{deck.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-12 relative z-10">
            <p className="text-theme-primary/60 max-w-sm mx-auto mb-2 text-sm">Chưa có từ vựng nào.</p>
            {onNavigateAdd && <button
              onClick={onNavigateAdd}
              className="bg-theme-accent hover:bg-[#a00000] text-white font-medium py-3 px-10 rounded transition-colors"
            >
              Thêm từ vựng
            </button>}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center relative z-10">
            {onNavigateAdd && <button
              onClick={onNavigateAdd}
              className="border border-theme-subtle text-theme-primary bg-theme-panel hover:border-theme-accent hover:text-theme-accent font-medium py-3 px-10 transition-colors uppercase tracking-[0.2em] text-[11px]"
            >
              Thêm từ vựng mới
            </button>}`;

code = code.replace(btnSearch, btnReplace);
fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched Dashboard.tsx successfully.");
