const fs = require('fs');
const content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const target = `  const card = hoveredCard.card;
  if (!card || !card.meaning) return <Fragment>{text}</Fragment>;

  const meanings = card.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);`;

const replacement = `  const card = hoveredCard.card;
  if (!card || !card.meaning) return <Fragment>{text}</Fragment>;

  let meanings = card.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (hoveredCard.matchedForm && hoveredCard.matchedForm.meaning) {
    meanings = hoveredCard.matchedForm.meaning.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
  }`;

if (content.includes(target)) {
  fs.writeFileSync('src/utils/highlight.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
