const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let code = fs.readFileSync(file, 'utf8');

const helper = `\nexport function calculateMasteryPercent(word: IntensiveWord): number {
  if (!word.examples || word.examples.length === 0) return 0;
  const targetScore = Math.max(1, word.examples.length * 3);
  let currentScore = word.reviewScore || 0;
  let legacyScore = 0;
  word.examples.forEach(ex => {
    if (ex.jaToViMastered || ex.viToJaMastered || ex.mastered) {
      legacyScore += 3;
    }
  });
  const finalScore = Math.max(currentScore, legacyScore);
  return Math.max(0, Math.min(100, Math.round((finalScore / targetScore) * 100)));
}\n`;

const targetImport = "import { getCategoryBadgeStyle } from \"./IntensiveStudy\";"; // wait, getting it from itself? No, we just put it near the top.
// Actually, let's put it after getCategoryBadgeStyle
const target = "export function getCategoryBadgeStyle";
if (!code.includes("export function calculateMasteryPercent")) {
  code = code.replace(target, helper + "\n" + target);
}

// Replace pattern 1
code = code.replace(
  /const targetScore = Math\.max\(1, word\.examples\.length \* 3\);\s*const percent = Math\.max\(0, Math\.min\(100, Math\.round\(\(\(word\.reviewScore \|\| 0\) \/ targetScore\) \* 100\)\)\);/g,
  "const percent = calculateMasteryPercent(word);"
);

// Replace pattern 2 (for entry)
code = code.replace(
  /const targetScore = Math\.max\(1, entry\.examples\.length \* 3\);\s*const percent = Math\.max\(0, Math\.min\(100, Math\.round\(\(\(entry\.reviewScore \|\| 0\) \/ targetScore\) \* 100\)\)\);/g,
  "const percent = calculateMasteryPercent(entry);"
);

fs.writeFileSync(file, code);
console.log("Patched successfully.");
