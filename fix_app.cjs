const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Revert the wrong one:
content = content.replace(
  `onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}\n            onAddIntensiveWord={addIntensiveWord}\n          />\n        )}\n        \n        {view === 'short_study' && (`,
  `onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}\n          />\n        )}\n        \n        {view === 'short_study' && (`
);

// Apply to the correct one (ConversationView):
content = content.replace(
  `onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}\n          />\n        )}\n      </main>`,
  `onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}\n            onAddIntensiveWord={addIntensiveWord}\n          />\n        )}\n      </main>`
);

fs.writeFileSync('src/App.tsx', content);
