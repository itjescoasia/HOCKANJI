const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Move targetWord fallback AFTER uniqueCandidates loop
// Find the start of targetWord fallback
const targetStartIdx = content.indexOf('  // Fallback for the targetWord of this intensive item');
// Find the end of targetWord fallback (before uniqueCandidates loop)
const targetEndIdx = content.indexOf('  uniqueCandidates.forEach(({ matchStr, card, isStem, matchedForm }) => {');

const targetFallbackCode = content.substring(targetStartIdx, targetEndIdx);
let newContent = content.substring(0, targetStartIdx) + content.substring(targetEndIdx);

// Insert targetFallbackCode after uniqueCandidates loop
const uniqueCandidatesEndIdx = newContent.indexOf('  const cardCounts = new Map<string, number>();');
newContent = newContent.substring(0, uniqueCandidatesEndIdx) + targetFallbackCode + newContent.substring(uniqueCandidatesEndIdx);

// 2. Fix the status assignment in uniqueCandidates to use 'target' if it's the target card
const statusCode = `    let status: 'good' | 'bad' | 'neutral' | 'new' | 'target' = 'good';
    if (targetWord && (card.kanji === targetWord || card.reading === targetWord || card.id === targetWordCard?.id)) {
      status = 'target';
    } else if (vocabScores && vocabScores[card.id] !== undefined) {`;

newContent = newContent.replace(
`    let status: 'good' | 'bad' | 'neutral' | 'new' | 'target' = 'good';
    if (vocabScores && vocabScores[card.id] !== undefined) {`,
statusCode);

// 3. Remove the greedy [ぁ-ん]* from the targetWord fallback to prevent over-highlighting if no forms exist
newContent = newContent.replace(/const regex = new RegExp\(\`\(\\\$\{safeStem\}\[ぁ-ん\]\*\)\`, 'g'\);/g, "const regex = new RegExp(`(${safeStem})`, 'g');");
// Wait, the backticks in regex might be tricky to replace via replace string. Let's use exact match.
newContent = newContent.replace("const regex = new RegExp(`(${safeStem}[ぁ-ん]*)`, 'g');", "const regex = new RegExp(`(${safeStem})`, 'g');");

fs.writeFileSync(file, newContent);
console.log('Patched!');
