const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// Find where RelatedHighlight starts
const startIdx = content.indexOf('export const RelatedHighlight: React.FC<{ text: string, type: \\'hiragana\\' | \\'romaji\\' }> = ({ text, type }) => {');
const endIdx = content.indexOf('import { KanjiCard } from \\'../types\\';');

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) {
      const clean = text.replace(/\\*/g, '');
      return <Fragment>{clean}</Fragment>;
  }

  let cleanText = text;
  let manualMatch = { index: -1, length: 0, str: '' };
  const firstStar = text.indexOf('*');
  if (firstStar !== -1) {
      const secondStar = text.indexOf('*', firstStar + 1);
      if (secondStar !== -1) {
          const matchedPhrase = text.substring(firstStar + 1, secondStar);
          cleanText = text.substring(0, firstStar) + matchedPhrase + text.substring(secondStar + 1);
          manualMatch = { index: firstStar, length: matchedPhrase.length, str: matchedPhrase };
      }
  }

  let target = '';
  let index = 0;
  
  if (type === 'hiragana') {
    target = hoveredCard.card.reading;
    index = hoveredCard.occurrenceIndex?.reading || 0;
  } else {
    target = hoveredCard.card.romaji;
    index = hoveredCard.occurrenceIndex?.romaji || 0;
  }

  if (!target) {
    return <Fragment>{cleanText}</Fragment>;
  }
  
  target = target.trim();
  let matchStr = target;
  let lowerText = cleanText.toLowerCase();
  
  if (!lowerText.includes(matchStr.toLowerCase())) {
    // Try prefix matching for conjugated verbs/adjectives
    let found = false;
    for (let i = matchStr.length - 1; i >= Math.max(1, Math.floor(matchStr.length / 2)); i--) {
      const prefix = matchStr.substring(0, i);
      if (lowerText.includes(prefix.toLowerCase())) {
        if (type === 'hiragana') {
            const regex = new RegExp(\`(\${prefix}[ぁ-ん]*)\`, 'i');
            const match = cleanText.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        } else if (type === 'romaji') {
            const regex = new RegExp(\`(?:^|[^a-z])(\${prefix}[a-z]*)\`, 'i');
            const match = cleanText.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        }
        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found && manualMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
    }
  }

  if (manualMatch.index !== -1) {
      const before = cleanText.substring(0, manualMatch.index);
      const match = manualMatch.str;
      const after = cleanText.substring(manualMatch.index + manualMatch.length);
      return (
        <Fragment>
          {before}
          <span className="px-1 rounded transition-all duration-200 bg-theme-accent text-white font-bold scale-110 shadow-sm inline-block z-10 relative">
            {match}
          </span>
          {after}
        </Fragment>
      );
  }

  // To prevent regex errors with special characters
  const safeMatchStr = matchStr.replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
  const regex = new RegExp(\`(\${safeMatchStr})\`, 'gi');
  const parts = cleanText.split(regex);
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
    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync('src/utils/highlight.tsx', content);
    console.log("Successfully replaced RelatedHighlight");
} else {
    console.log("Could not find start or end index");
}
