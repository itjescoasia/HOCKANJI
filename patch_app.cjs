const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [intensiveSelectedWordId, setIntensiveSelectedWordId] =')) {
  code = code.replace(
    "const [listSearchQuery, setListSearchQuery] = useState('');",
    "const [listSearchQuery, setListSearchQuery] = useState('');\n  const [intensiveSearchQuery, setIntensiveSearchQuery] = useState('');\n  const [intensiveSelectedWordId, setIntensiveSelectedWordId] = useState<string | null>(null);"
  );
}

const targetDashboard = `<Dashboard 
            deck={deck} 
            intensiveDeck={intensiveDeck}
            dueCards={dueCards} 
            stats={stats}
            leftoverNewCards={leftoverNewCards}
            onStartReview={handleStartReview} 
            onStartFreeStudy={handleStartFreeStudy}
            onStartDifficultReview={handleStartDifficultReview}
            onStartShortStudy={handleStartShortStudy}
            onStartSentenceReview={handleStartSentenceReview}
            onNavigateAdd={() => handleNavigate('add')} 
            onRecordWordOfTheDay={recordWordOfTheDay}
          />`;
const replacementDashboard = `<Dashboard 
            deck={deck} 
            intensiveDeck={intensiveDeck}
            dueCards={dueCards} 
            stats={stats}
            leftoverNewCards={leftoverNewCards}
            onStartReview={handleStartReview} 
            onStartFreeStudy={handleStartFreeStudy}
            onStartDifficultReview={handleStartDifficultReview}
            onStartShortStudy={handleStartShortStudy}
            onStartSentenceReview={handleStartSentenceReview}
            onNavigateAdd={() => handleNavigate('add')} 
            onRecordWordOfTheDay={recordWordOfTheDay}
            onNavigateToWord={(word, isIntensive, id) => {
              if (isIntensive) {
                setIntensiveSearchQuery(word);
                setIntensiveSelectedWordId(id);
                setView('intensive_vocab');
              } else {
                setListSearchQuery(word);
                setView('list');
              }
            }}
          />`;

if (code.includes(targetDashboard)) {
  code = code.replace(targetDashboard, replacementDashboard);
}

const targetIntensive = `<IntensiveStudy 
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onUpdateWord={updateIntensiveWord}
            onReorderDeck={reorderIntensiveWords}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, false)}
          />`;
const replacementIntensive = `<IntensiveStudy 
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onUpdateWord={updateIntensiveWord}
            onReorderDeck={reorderIntensiveWords}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, false)}
            initialSearchQuery={intensiveSearchQuery}
            initialSelectedWordId={intensiveSelectedWordId}
          />`;

if (code.includes(targetIntensive)) {
  code = code.replace(targetIntensive, replacementIntensive);
}

fs.writeFileSync(file, code);
