const fs = require('fs');
let file = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const oldLogic = `                    examples: conversation.dialogues.map(d => ({
                      id: d.id,
                      sentence: d.japanese,
                      reading: d.hiragana,
                      romaji: d.romaji,
                      translation: d.vietnamese,
                      specialNote: d.explanation
                    }))`;

const newLogic = `                    examples: conversation.dialogues.map(d => ({
                      id: d.id,
                      sentence: d.japanese,
                      reading: d.hiragana,
                      romaji: d.romaji,
                      translation: d.vietnamese,
                      specialNote: d.explanation,
                      jaToViMastered: d.jaToViMastered,
                      viToJaMastered: d.viToJaMastered,
                      jaToViNextReviewDate: d.jaToViNextReviewDate,
                      viToJaNextReviewDate: d.viToJaNextReviewDate,
                      jaToViInterval: d.jaToViInterval,
                      viToJaInterval: d.viToJaInterval,
                      jaToViFailCount: d.jaToViFailCount,
                      viToJaFailCount: d.viToJaFailCount,
                      jaToViRepetition: d.jaToViRepetition,
                      viToJaRepetition: d.viToJaRepetition,
                      jaToViEaseFactor: d.jaToViEaseFactor,
                      viToJaEaseFactor: d.viToJaEaseFactor
                    }))`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/ConversationView.tsx', file);
console.log('Patched ConversationView');
