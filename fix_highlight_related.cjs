const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const targetStr = `  if (type === 'hiragana') {
    target = hoveredCard.card.reading;
    index = hoveredCard.occurrenceIndex?.reading || 0;
  } else {
    target = hoveredCard.card.romaji;
    index = hoveredCard.occurrenceIndex?.romaji || 0;
  }`;

const replaceStr = `  if (type === 'hiragana') {
    target = (hoveredCard.matchedForm && hoveredCard.matchedForm.reading) ? hoveredCard.matchedForm.reading : hoveredCard.card.reading;
    index = hoveredCard.occurrenceIndex?.reading || 0;
  } else {
    target = (hoveredCard.matchedForm && hoveredCard.matchedForm.romaji) ? hoveredCard.matchedForm.romaji : hoveredCard.card.romaji;
    index = hoveredCard.occurrenceIndex?.romaji || 0;
  }`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/utils/highlight.tsx', content);
