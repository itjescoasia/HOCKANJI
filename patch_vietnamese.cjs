const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target1 = `export const HighlightVietnamese: React.FC<{ text: string }> = ({ text }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) return <Fragment>{text}</Fragment>;`;

const replacement1 = `export const HighlightVietnamese: React.FC<{ text: string }> = ({ text }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) {
      // If there are manual asterisks but no hover, we could just render without them,
      // but typically without hover we don't highlight. Let's just strip asterisks if no hover.
      const clean = text.replace(/\\*/g, '');
      return <Fragment>{clean}</Fragment>;
  }

  // Check for manual *highlights* in Vietnamese text first
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

const target2 = `  let meanings = card.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (hoveredCard.matchedForm && hoveredCard.matchedForm.meaning) {
    meanings = hoveredCard.matchedForm.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  
  let bestMatch = { index: -1, length: 0, str: '' };
  const lowerText = text.toLowerCase();`;

const replacement2 = `  let meanings = card.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (hoveredCard.matchedForm && hoveredCard.matchedForm.meaning) {
    meanings = hoveredCard.matchedForm.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  
  let bestMatch = manualMatch;
  const lowerText = cleanText.toLowerCase();`;

const target3 = `  if (bestMatch.index === -1) {
      return <Fragment>{text}</Fragment>;
  }

  const before = text.substring(0, bestMatch.index);
  const match = bestMatch.str;
  const after = text.substring(bestMatch.index + bestMatch.length);`;

const replacement3 = `  if (bestMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
  }

  const before = cleanText.substring(0, bestMatch.index);
  const match = bestMatch.str;
  const after = cleanText.substring(bestMatch.index + bestMatch.length);`;

const target4 = `          const matches = [...text.matchAll(regex)];
          for (const match of matches) {
            if (match.index !== undefined) {
              const matchedStr = match[1];
              // text.indexOf is used to get the exact original casing
              const exactIdx = text.indexOf(matchedStr, match.index);
              if (exactIdx !== -1 && matchedStr.length > bestMatch.length) {
                bestMatch = { index: exactIdx, length: matchedStr.length, str: text.substring(exactIdx, exactIdx + matchedStr.length) };
              }
            }
          }`;

const replacement4 = `          const matches = [...cleanText.matchAll(regex)];
          for (const match of matches) {
            if (match.index !== undefined) {
              const matchedStr = match[1];
              const exactIdx = cleanText.indexOf(matchedStr, match.index);
              if (exactIdx !== -1 && matchedStr.length > bestMatch.length) {
                bestMatch = { index: exactIdx, length: matchedStr.length, str: cleanText.substring(exactIdx, exactIdx + matchedStr.length) };
              }
            }
          }`;

const target5 = `  // 1. Exact match for each meaning segment
  meanings.forEach(m => {
    const lowerM = m.toLowerCase();
    const idx = lowerText.indexOf(lowerM);
    if (idx !== -1 && m.length > bestMatch.length) {
      bestMatch = { index: idx, length: m.length, str: text.substring(idx, idx + m.length) };
    }
  });`;

const replacement5 = `  // 1. Exact match for each meaning segment
  if (manualMatch.index === -1) {
    meanings.forEach(m => {
      const lowerM = m.toLowerCase();
      const idx = lowerText.indexOf(lowerM);
      if (idx !== -1 && m.length > bestMatch.length) {
        bestMatch = { index: idx, length: m.length, str: cleanText.substring(idx, idx + m.length) };
      }
    });
  }`;

const target6 = `  // 2. Partial / word-sequence matching if no exact match is found
  if (bestMatch.index === -1) {`;

const replacement6 = `  // 2. Partial / word-sequence matching if no exact match is found
  if (bestMatch.index === -1 && manualMatch.index === -1) {`;

content = content.replace(target1, replacement1)
                 .replace(target2, replacement2)
                 .replace(target3, replacement3)
                 .replace(target4, replacement4)
                 .replace(target5, replacement5)
                 .replace(target6, replacement6);

fs.writeFileSync('src/utils/highlight.tsx', content);
console.log("Patched Vietnamese highlighting to support *manual highlights*");
