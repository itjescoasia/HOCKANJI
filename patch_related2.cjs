const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target1 = `export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) return <Fragment>{text}</Fragment>;`;

const replacement1 = `export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
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
  }`;

const target2 = `  if (!target) {
    return <Fragment>{text}</Fragment>;
  }
  
  target = target.trim();
  let matchStr = target;
  let lowerText = text.toLowerCase();`;

const replacement2 = `  if (!target) {
    return <Fragment>{cleanText}</Fragment>;
  }
  
  target = target.trim();
  let matchStr = target;
  let lowerText = cleanText.toLowerCase();`;

const target3 = `        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found) {
      return <Fragment>{text}</Fragment>;
    }
  }`;

const replacement3 = `        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found && manualMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
    }
  }`;

const target4 = `  // To prevent regex errors with special characters
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
  );`;

const replacement4 = `  if (manualMatch.index !== -1) {
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
  );`;

content = content.replace(target1, replacement1)
                 .replace(target2, replacement2)
                 .replace(target3, replacement3)
                 .replace(target4, replacement4);

fs.writeFileSync('src/utils/highlight.tsx', content);
console.log("Patched RelatedHighlight to support *manual highlights*");
