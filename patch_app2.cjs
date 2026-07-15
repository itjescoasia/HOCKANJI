const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`          <IntensiveStudy 
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onUpdateWord={updateIntensiveWord}
            onReorderDeck={reorderIntensiveWords}
          />`,
`          <IntensiveStudy 
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onUpdateWord={updateIntensiveWord}
            onReorderDeck={reorderIntensiveWords}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true, 'intensive_vocab')}
          />`
);

content = content.replace(
`          <ConversationView
            conversations={conversations}
            onAddConversation={addConversation}
            onRemoveConversation={removeConversation}
            onUpdateConversation={updateConversation}
            onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            mainDeck={deck}
          />`,
`          <ConversationView
            conversations={conversations}
            onAddConversation={addConversation}
            onRemoveConversation={removeConversation}
            onUpdateConversation={updateConversation}
            onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            mainDeck={deck}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true, 'conversation')}
          />`
);

fs.writeFileSync(file, content);
console.log('Patched App.tsx properly');
