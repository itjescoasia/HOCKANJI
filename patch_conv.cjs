const fs = require('fs');
const file = 'src/components/ConversationView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`  onRecordReview?: (isCorrect: boolean) => void;
  mainDeck: KanjiCard[];
}`,
`  onRecordReview?: (isCorrect: boolean) => void;
  mainDeck: KanjiCard[];
  onStartTopicReview?: (topicDeck: any[]) => void;
}`
);

content = content.replace(
`  onReviewCard,
  onRecordReview,
  mainDeck,
}: ConversationViewProps) {`,
`  onReviewCard,
  onRecordReview,
  mainDeck,
  onStartTopicReview,
}: ConversationViewProps) {`
);

fs.writeFileSync(file, content);
console.log('Patched ConversationView.tsx Props');
