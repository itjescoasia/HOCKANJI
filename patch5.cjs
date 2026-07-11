const fs = require('fs');
const content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const target = `{word.reading && (
                        <span className="text-theme-accent text-sm font-medium truncate">
                          <SearchHighlight text={word.reading} query={searchQuery} />
                        </span>
                      )}`;
const replacement = `{word.reading && (
                        <span className="text-theme-accent text-sm font-medium truncate">
                          <SearchHighlight text={word.reading} query={searchQuery} />
                        </span>
                      )}
                      {word.romaji && (
                        <span className="text-theme-primary/60 text-xs font-medium truncate">
                          <SearchHighlight text={word.romaji} query={searchQuery} />
                        </span>
                      )}`;

if (content.includes(target)) {
  fs.writeFileSync('src/components/IntensiveStudy.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
