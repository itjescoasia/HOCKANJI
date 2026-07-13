const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const targetStr = `  const before = cleanText.substring(0, bestMatch.index);
  const match = bestMatch.str;
  const after = cleanText.substring(bestMatch.index + bestMatch.length);

  return (
    <Fragment>
      {before}
      <span className="bg-theme-accent text-white font-bold px-1 rounded scale-110 shadow-sm inline-block z-10 relative transition-all duration-200">
        {match}
      </span>
      {after}
    </Fragment>
  );`;

const replacement = `  const matchStr = bestMatch.str;
  const safeMatchStr = matchStr.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
  const regex = new RegExp(\`(\${safeMatchStr})\`, 'gi');
  const parts = cleanText.split(regex);
  let matchCount = 0;
  const targetIndex = hoveredCard.index || 0;

  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === matchStr.toLowerCase()) {
          const isCurrentMatch = matchCount === targetIndex;
          matchCount++;
          return <span key={i} className={\`px-1 rounded transition-all duration-200 \${isCurrentMatch ? 'bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative' : 'bg-theme-accent/20 text-theme-accent font-bold'}\`}>{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/utils/highlight.tsx', content);
