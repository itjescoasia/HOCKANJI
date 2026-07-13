const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// The file is currently corrupted, let's just rewrite the end of HighlightVietnamese.
// We know HighlightVietnamese ends before `export const tokenizeExampleText = (example: string, targetWord: string, mainDeck?: KanjiCard[], fallbackTargetCard?: KanjiCard, vocabScores?: Record<string, number>) => {`

const startIdx = content.indexOf('  if (bestMatch.index === -1) {');
const endIdx = content.indexOf('};', startIdx) + 2;

const newCode = `  if (bestMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
  }

  const matchStr = bestMatch.str;
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
  );
};`;

content = content.substring(0, startIdx) + newCode + content.substring(endIdx);
fs.writeFileSync('src/utils/highlight.tsx', content);
