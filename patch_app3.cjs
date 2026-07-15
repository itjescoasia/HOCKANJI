const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace states
content = content.replace(
`  const [sentenceReviewMode, setSentenceReviewMode] = useState<'JA_TO_VI' | 'VI_TO_JA'>('JA_TO_VI');
  const [sentenceReviewTargetDeck, setSentenceReviewTargetDeck] = useState<any[] | null>(null);
  const [sentenceReviewForceAll, setSentenceReviewForceAll] = useState(false);
  const [sentenceReviewReturnView, setSentenceReviewReturnView] = useState<string>('dashboard');`,
`  const [sentenceReviewMode, setSentenceReviewMode] = useState<'JA_TO_VI' | 'VI_TO_JA'>('JA_TO_VI');
  const [sentenceReviewTargetDeck, setSentenceReviewTargetDeck] = useState<any[] | null>(null);
  const [sentenceReviewForceAll, setSentenceReviewForceAll] = useState(false);
  const [isSentenceReviewOpen, setIsSentenceReviewOpen] = useState(false);`
);

// Replace handleStartSentenceReview
content = content.replace(
`  const handleStartSentenceReview = (mode: 'JA_TO_VI' | 'VI_TO_JA', targetDeck: any[] | null = null, forceAll: boolean = false, returnView: string = 'dashboard') => {
    setSentenceReviewMode(mode);
    setSentenceReviewTargetDeck(targetDeck);
    setSentenceReviewForceAll(forceAll);
    setSentenceReviewReturnView(returnView);
    setView('sentence_review');
  };`,
`  const handleStartSentenceReview = (mode: 'JA_TO_VI' | 'VI_TO_JA', targetDeck: any[] | null = null, forceAll: boolean = false) => {
    setSentenceReviewMode(mode);
    setSentenceReviewTargetDeck(targetDeck);
    setSentenceReviewForceAll(forceAll);
    setIsSentenceReviewOpen(true);
  };`
);

// Replace the intensive_vocab call
content = content.replace(
`onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true, 'intensive_vocab')}`,
`onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}`
);

// Replace the conversation call
content = content.replace(
`onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true, 'conversation')}`,
`onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, true)}`
);

// Replace the view === 'sentence_review' block
content = content.replace(
`        {view === 'sentence_review' && (
          <div className="fixed inset-0 z-50 bg-theme-base-alt overflow-y-auto w-full h-full">
            <SentenceReview
              deck={sentenceReviewTargetDeck || intensiveDeck}
              mainDeck={deck}
              mode={sentenceReviewMode}
              forceAll={sentenceReviewForceAll}
              onClose={() => setView(sentenceReviewReturnView)}
              onUpdateWord={sentenceReviewTargetDeck ? undefined : updateIntensiveWord}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />
          </div>
        )}`,
``
);

// Append the modal at the end, right before </main>
content = content.replace(
`      </main>
    </div>
  );
}`,
`        {isSentenceReviewOpen && (
          <div className="fixed inset-0 z-50 bg-theme-base-alt overflow-y-auto w-full h-full">
            <SentenceReview
              deck={sentenceReviewTargetDeck || intensiveDeck}
              mainDeck={deck}
              mode={sentenceReviewMode}
              forceAll={sentenceReviewForceAll}
              onClose={() => setIsSentenceReviewOpen(false)}
              onUpdateWord={sentenceReviewTargetDeck ? undefined : updateIntensiveWord}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />
          </div>
        )}
      </main>
    </div>
  );
}`
);

fs.writeFileSync(file, content);
console.log('Patched App.tsx modal');
