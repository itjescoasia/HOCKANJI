const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`  const [sentenceReviewMode, setSentenceReviewMode] = useState<'JA_TO_VI' | 'VI_TO_JA'>('JA_TO_VI');`,
`  const [sentenceReviewMode, setSentenceReviewMode] = useState<'JA_TO_VI' | 'VI_TO_JA'>('JA_TO_VI');
  const [sentenceReviewTargetDeck, setSentenceReviewTargetDeck] = useState<any[] | null>(null);
  const [sentenceReviewForceAll, setSentenceReviewForceAll] = useState(false);
  const [sentenceReviewReturnView, setSentenceReviewReturnView] = useState<string>('dashboard');
`
);

content = content.replace(
`  const handleStartSentenceReview = (mode: 'JA_TO_VI' | 'VI_TO_JA') => {
    setSentenceReviewMode(mode);
    setView('sentence_review');
  };`,
`  const handleStartSentenceReview = (mode: 'JA_TO_VI' | 'VI_TO_JA', targetDeck: any[] | null = null, forceAll: boolean = false, returnView: string = 'dashboard') => {
    setSentenceReviewMode(mode);
    setSentenceReviewTargetDeck(targetDeck);
    setSentenceReviewForceAll(forceAll);
    setSentenceReviewReturnView(returnView);
    setView('sentence_review');
  };`
);

content = content.replace(
`            <SentenceReview
              deck={intensiveDeck}
              mainDeck={deck}
              mode={sentenceReviewMode}
              onClose={() => setView('dashboard')}
              onUpdateWord={updateIntensiveWord}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />`,
`            <SentenceReview
              deck={sentenceReviewTargetDeck || intensiveDeck}
              mainDeck={deck}
              mode={sentenceReviewMode}
              forceAll={sentenceReviewForceAll}
              onClose={() => setView(sentenceReviewReturnView)}
              onUpdateWord={sentenceReviewTargetDeck ? undefined : updateIntensiveWord}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />`
);

content = content.replace(
`          <IntensiveStudy
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onUpdateWord={updateIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onNavigateHome={() => setView('dashboard')}
          />`,
`          <IntensiveStudy
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onUpdateWord={updateIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onNavigateHome={() => setView('dashboard')}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true, 'intensive_vocab')}
          />`
);

content = content.replace(
`          <ConversationView
            conversations={conversations}
            mainDeck={deck}
            onAddConversation={addConversation}
            onUpdateConversation={updateConversation}
            onRemoveConversation={removeConversation}
            onNavigateHome={() => setView('dashboard')}
          />`,
`          <ConversationView
            conversations={conversations}
            mainDeck={deck}
            onAddConversation={addConversation}
            onUpdateConversation={updateConversation}
            onRemoveConversation={removeConversation}
            onNavigateHome={() => setView('dashboard')}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true, 'conversation')}
          />`
);

fs.writeFileSync(file, content);
console.log('Patched App.tsx');
