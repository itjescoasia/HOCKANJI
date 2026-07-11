const fs = require('fs');
const content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const target = `{word.reading && (
          <div className="text-theme-accent opacity-90 font-medium mb-1 w-full truncate">
            {word.reading}
          </div>
        )}`;
const replacement = `{word.reading && (
          <div className="text-theme-accent opacity-90 font-medium mb-1 w-full truncate">
            {word.reading}
          </div>
        )}
        {word.romaji && (
          <div className="text-theme-primary/60 font-medium mb-1 w-full truncate text-sm">
            {word.romaji}
          </div>
        )}`;

if (content.includes(target)) {
  fs.writeFileSync('src/components/IntensiveStudy.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
