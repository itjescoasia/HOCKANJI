const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `    </div>
  );
}`;

const newContent = `
        {isSentenceReviewOpen && (
          <div className="fixed inset-0 z-50 bg-theme-base-alt overflow-y-auto w-full h-full">
            <SentenceReview
              deck={sentenceReviewTargetDeck || intensiveDeck}
              mainDeck={deck}
              mode={sentenceReviewMode}
              forceAll={sentenceReviewForceAll}
              onClose={() => setIsSentenceReviewOpen(false)}
              onUpdateWord={updateIntensiveWord}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />
          </div>
        )}
    </div>
  );
}`;

content = content.replace(target, newContent);

fs.writeFileSync(file, content);
console.log('Patched App.tsx modal');
