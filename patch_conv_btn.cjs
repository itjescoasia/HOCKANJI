const fs = require('fs');
const file = 'src/components/ConversationView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-theme-base border border-theme-subtle rounded p-0.5 gap-0.5 overflow-x-auto no-scrollbar">`;

const newStr = `          <div className="flex flex-wrap items-center gap-2">
            {onStartTopicReview && conversation.dialogues.length > 0 && (
              <button
                onClick={() => {
                  const topicDeck = [{
                    id: conversation.id,
                    word: conversation.title,
                    reading: '',
                    category: 'Conversation',
                    explanation: conversation.description || '',
                    createdAt: conversation.createdAt,
                    examples: conversation.dialogues.map(d => ({
                      id: d.id,
                      sentence: d.japanese,
                      reading: d.hiragana,
                      romaji: d.romaji,
                      translation: d.vietnamese,
                      specialNote: d.explanation
                    }))
                  }];
                  onStartTopicReview(topicDeck);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary text-theme-base rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-theme-accent transition-colors shrink-0"
              >
                <Eye className="w-3 h-3" />
                <span>Ôn câu ví dụ</span>
              </button>
            )}
            <div className="flex bg-theme-base border border-theme-subtle rounded p-0.5 gap-0.5 overflow-x-auto no-scrollbar">`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(file, content);
console.log('Patched button in ConversationDetail');
