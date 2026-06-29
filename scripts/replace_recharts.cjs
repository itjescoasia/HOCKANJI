const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const replacements = [
  { from: /stroke="#2a2a2a"/g, to: 'stroke="var(--border-subtle)"' },
  { from: /tick=\{\{fill: '#d4d4d4', opacity: 0.5/g, to: 'tick={{fill: "var(--text-muted)"' },
  { from: /tick=\{\{fill: '#d4d4d4', fontSize: 11\}\}/g, to: 'tick={{fill: "var(--text-muted)", fontSize: 11}}' },
  { from: /cursor=\{\{fill: '#1a1a1a'\}\}/g, to: 'cursor={{fill: "var(--bg-hover)"}}' },
  { from: /contentStyle=\{\{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: '4px' \}\}/g, to: 'contentStyle={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)", borderRadius: "4px" }}' },
  { from: /itemStyle=\{\{ color: '#d4d4d4', fontSize: '12px' \}\}/g, to: 'itemStyle={{ color: "var(--text-primary)", fontSize: "12px" }}' },
  { from: /labelStyle=\{\{ color: '#d4d4d4', fontSize: '12px', marginBottom: '4px' \}\}/g, to: 'labelStyle={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "4px" }}' },
  { from: /itemStyle=\{\{ fontSize: '12px' \}\}/g, to: 'itemStyle={{ color: "var(--text-primary)", fontSize: "12px" }}' },
  { from: /fill="#c5a059"/g, to: 'fill="var(--accent)"' },
  { from: /stroke="#c5a059"/g, to: 'stroke="var(--accent)"' },
  // specific chart lines
  { from: /fill: '#4a4a4a'/g, to: 'fill: "var(--text-muted)"' },
  { from: /stroke="#4a4a4a"/g, to: 'stroke="var(--text-muted)"' },
  { from: /fill="#4a90e2"/g, to: 'fill="#4a90e2"' }, // keep blue
];

replacements.forEach(({from, to}) => {
  content = content.replace(from, to);
});

fs.writeFileSync('src/components/Dashboard.tsx', content, 'utf8');
