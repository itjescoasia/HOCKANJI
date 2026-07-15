const fs = require('fs');
const file = 'src/components/ConversationView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`  if (viewState === "detail" && selectedConv) {
    return (
      <ConversationDetail
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
      />
    );
  }`,
`  if (viewState === "detail" && selectedConv) {
    return (
      <ConversationDetail
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
      />
    );
  }`
);

content = content.replace(
`function ConversationDetail({
  conversation,
  onBack,
  onUpdate,
  onUpdateCard,
  onReviewCard,
  onRecordReview,
  mainDeck,
}: {
  conversation: Conversation;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Conversation>) => void;
  onUpdateCard?: (id: string, updates: Partial<KanjiCard>) => void;
  onReviewCard?: (id: string, grade: 'forgot' | 'hard' | 'good' | 'easy') => void;
  onRecordReview?: (isCorrect: boolean) => void;
  mainDeck: KanjiCard[];
}) {`,
`function ConversationDetail({
  conversation,
  onBack,
  onUpdate,
  onUpdateCard,
  onReviewCard,
  onRecordReview,
  mainDeck,
  onStartTopicReview,
}: {
  conversation: Conversation;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Conversation>) => void;
  onUpdateCard?: (id: string, updates: Partial<KanjiCard>) => void;
  onReviewCard?: (id: string, grade: 'forgot' | 'hard' | 'good' | 'easy') => void;
  onRecordReview?: (isCorrect: boolean) => void;
  mainDeck: KanjiCard[];
  onStartTopicReview?: (topicDeck: any[]) => void;
}) {`
);

fs.writeFileSync(file, content);
console.log('Patched ConversationDetail props');
