const fs = require('fs');
const path = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';")) {
    code = code.replace(
        "import Markdown from 'react-markdown';",
        "import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';\nimport Markdown from 'react-markdown';"
    );
}

const targetInjection = `              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDeleteUnlocked(!isDeleteUnlocked)}`;

const chartCode = `
            </div>
            
            {deck.length > 0 && (
              <div className="mb-8 p-6 bg-theme-panel border border-theme-subtle rounded-xl w-full">
                <h3 className="text-sm font-bold uppercase tracking-widest text-theme-primary/60 mb-6 flex justify-between items-center">
                  <span>Thống kê mức độ thành thạo</span>
                  <span className="text-[10px] text-theme-primary/40 normal-case tracking-normal font-normal">Dựa trên tỷ lệ câu trả lời đúng</span>
                </h3>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deck.map(word => {
                        const targetScore = Math.max(1, word.examples.length * 3);
                        const percent = Math.max(0, Math.min(100, Math.round(((word.reviewScore || 0) / targetScore) * 100)));
                        return {
                          name: word.word,
                          percent: percent,
                          totalExamples: word.examples.length
                        };
                      }).sort((a, b) => b.percent - a.percent)}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-theme-primary/5" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'currentColor', fontSize: 10 }} 
                        className="text-theme-primary/60" 
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                      />
                      <YAxis 
                        tick={{ fill: 'currentColor', fontSize: 10 }} 
                        className="text-theme-primary/40" 
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(v) => \`\${v}%\`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-theme-panel border border-theme-subtle p-3 rounded shadow-lg text-theme-primary">
                                <p className="font-bold mb-1 text-sm">{data.name}</p>
                                <p className="text-xs opacity-70 mb-1">{data.totalExamples} mẫu câu</p>
                                <p className="text-sm font-bold text-theme-accent">{data.percent}% thành thạo</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {
                          deck.map((entry, index) => {
                            const targetScore = Math.max(1, entry.examples.length * 3);
                            const percent = Math.max(0, Math.min(100, Math.round(((entry.reviewScore || 0) / targetScore) * 100)));
                            let color = "#3b82f6"; // accent (blue)
                            if (percent >= 80) color = "#22c55e"; // green-500
                            else if (percent >= 40) color = "#f97316"; // orange-500
                            return <Cell key={\`cell-\${index}\`} fill={color} />;
                          })
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDeleteUnlocked(!isDeleteUnlocked)}`;

if (!code.includes("Thống kê mức độ thành thạo")) {
  code = code.replace(targetInjection, chartCode);
} else {
  console.log("Chart code already exists");
}

fs.writeFileSync(path, code);
console.log("Patched chart successfully");
