const fs = require('fs');
const lines = fs.readFileSync('src/utils/highlight.tsx', 'utf8').split('\n');

const head = lines.slice(0, 18).join('\n');
const tail = lines.slice(96).join('\n');

const middle = `
export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) return <Fragment>{text}</Fragment>;

  const { card, index } = hoveredCard;
  let target = type === 'hiragana' ? card.reading : card.romaji;
  
  if (!target) {
    return <Fragment>{text}</Fragment>;
  }
  
  target = target.trim();
  let matchStr = target;
  let lowerText = text.toLowerCase();
  
  if (!lowerText.includes(matchStr.toLowerCase())) {
    // Try prefix matching for conjugated verbs/adjectives
    let found = false;
    for (let i = matchStr.length - 1; i >= Math.max(1, Math.floor(matchStr.length / 2)); i--) {
      const prefix = matchStr.substring(0, i);
      if (lowerText.includes(prefix.toLowerCase())) {
        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found) {
      return <Fragment>{text}</Fragment>;
    }
  }

  // To prevent regex errors with special characters
  const safeMatchStr = matchStr.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
  const regex = new RegExp(\`(\${safeMatchStr})\`, 'gi');
  const parts = text.split(regex);
  let matchCount = 0;

  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === matchStr.toLowerCase()) {
          const isCurrentMatch = matchCount === index;
          matchCount++;
          return <span key={i} className={\`px-1 rounded transition-all duration-200 \${isCurrentMatch ? 'bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative' : 'bg-theme-accent/20 text-theme-accent font-bold'}\`}>{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );
};
`;

fs.writeFileSync('src/utils/highlight.tsx', head + '\n' + middle.trim() + '\n' + tail);
