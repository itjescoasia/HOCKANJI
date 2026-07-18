const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `              onUpdateWord={updateIntensiveWord}`;

const newLogic = `              onUpdateWord={(id, updates) => {
                const conv = conversations.find(c => c.id === id);
                if (conv) {
                  const updatedDialogues = conv.dialogues.map(d => {
                    const ex = updates.examples?.find(e => e.id === d.id);
                    if (ex) {
                      return {
                        ...d,
                        jaToViMastered: ex.jaToViMastered,
                        viToJaMastered: ex.viToJaMastered,
                        jaToViNextReviewDate: ex.jaToViNextReviewDate,
                        viToJaNextReviewDate: ex.viToJaNextReviewDate,
                        jaToViInterval: ex.jaToViInterval,
                        viToJaInterval: ex.viToJaInterval,
                        jaToViFailCount: ex.jaToViFailCount,
                        viToJaFailCount: ex.viToJaFailCount,
                        jaToViRepetition: ex.jaToViRepetition,
                        viToJaRepetition: ex.viToJaRepetition,
                        jaToViEaseFactor: ex.jaToViEaseFactor,
                        viToJaEaseFactor: ex.viToJaEaseFactor
                      };
                    }
                    return d;
                  });
                  updateConversation(id, { dialogues: updatedDialogues });
                } else {
                  updateIntensiveWord(id, updates);
                }
              }}`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', file);
console.log('Patched App');
