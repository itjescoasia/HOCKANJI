const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetRender = `<ConversationDetail
            conversations={conversations}
            conversation={selectedConv}
            onBack={() => {
              setViewState("list");
              setSelectedConvId(null);
            }}
            onUpdate={(id, updates) => onUpdateConversation(id, updates)}
            onUpdateCard={onUpdateCard}
            onReviewCard={onReviewCard}
            onRecordReview={onRecordReview}
            mainDeck={mainDeck}
            onStartTopicReview={onStartTopicReview}
          />`;

const replaceRender = `<ConversationDetail
            conversations={conversations}
            conversation={selectedConv}
            onBack={() => {
              setViewState("list");
              setSelectedConvId(null);
            }}
            onUpdate={(id, updates) => onUpdateConversation(id, updates)}
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
console.log("Patched ConversationDetail render");
