const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// Update ConversationDetail props interface and destructured arguments
content = content.replace(
  `  onStartTopicReview?: (topicDeck: any[]) => void;\n}) {`,
  `  onStartTopicReview?: (topicDeck: any[]) => void;\n  onRemoveConversation: (id: string) => void;\n  onAddIntensiveWord?: (word: any) => void;\n}) {`
);

content = content.replace(
  `  onStartTopicReview,\n}: {\n  conversation: Conversation;`,
  `  onStartTopicReview,\n  onRemoveConversation,\n  onAddIntensiveWord,\n}: {\n  conversation: Conversation;`
);

// Update where ConversationDetail is rendered inside ConversationView
const targetRender = `<ConversationDetail
            conversation={selectedConv}
            conversations={conversations}
            onBack={() => setViewState("list")}
            onUpdate={onUpdateConversation}
            onUpdateCard={onUpdateCard}
            onReviewCard={onReviewCard}
            onRecordReview={onRecordReview}
            mainDeck={mainDeck}
            onStartTopicReview={onStartTopicReview}
          />`;

const replaceRender = `<ConversationDetail
            conversation={selectedConv}
            conversations={conversations}
            onBack={() => setViewState("list")}
            onUpdate={onUpdateConversation}
            onUpdateCard={onUpdateCard}
            onReviewCard={onReviewCard}
            onRecordReview={onRecordReview}
            mainDeck={mainDeck}
            onStartTopicReview={onStartTopicReview}
            onRemoveConversation={onRemoveConversation}
            onAddIntensiveWord={onAddIntensiveWord}
          />`;

content = content.replace(targetRender, replaceRender);

fs.writeFileSync('src/components/ConversationView.tsx', content);
console.log("Patched ConversationDetail");
