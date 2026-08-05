const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}\n          />",
  "onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}\n            onAddIntensiveWord={addIntensiveWord}\n          />"
);
fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
