const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `function getVocabForConversation(conversation: Conversation, mainDeck: KanjiCard[]): KanjiCard[] {
  const uniqueWords = new Map<string, KanjiCard>();
  const combinedText = conversation.dialogues.map(d => d.japanese).join(" ");
  
  mainDeck.forEach(card => {
    const wordStr = card.kanji || card.reading;
    if (!wordStr || wordStr.length === 0) return;
    
    let isMatch = combinedText.includes(wordStr);
    
    if (!isMatch && card.kanji) {
      const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
      if (stem && stem !== card.kanji && /[\\u4e00-\\u9faf々]/.test(stem) && combinedText.includes(stem)) {
        isMatch = true;
      }
    }

    if (!isMatch && card.forms) {
      for (const form of card.forms) {
        if (form.value && combinedText.includes(form.value)) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      if (!uniqueWords.has(wordStr)) {
        uniqueWords.set(wordStr, card);
      }
    }
  });

  return Array.from(uniqueWords.values());
}`;

const replacementStr = `function getVocabForConversation(conversation: Conversation, mainDeck: KanjiCard[]): KanjiCard[] {
  const uniqueWords = new Map<string, KanjiCard>();
  const combinedText = conversation.dialogues.map(d => d.japanese).join(" ");
  
  const asteriskWords = new Set<string>();
  const regex = /\\*([^\\*]+)\\*/g;
  let match;
  while ((match = regex.exec(combinedText)) !== null) {
    asteriskWords.add(match[1]);
  }
  
  mainDeck.forEach(card => {
    const wordStr = card.kanji || card.reading;
    if (!wordStr || wordStr.length === 0) return;
    
    let isMatch = false;
    
    if (asteriskWords.size > 0) {
      for (const aw of asteriskWords) {
        if (aw.includes(wordStr)) {
          isMatch = true; break;
        }
        if (card.kanji) {
          const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
          if (stem && stem !== card.kanji && /[\\u4e00-\\u9faf々]/.test(stem) && aw.includes(stem)) {
            isMatch = true; break;
          }
        }
        if (card.forms) {
          for (const form of card.forms) {
            if (form.value && aw.includes(form.value)) {
              isMatch = true; break;
            }
          }
        }
      }
    } else {
      isMatch = combinedText.includes(wordStr);
      if (!isMatch && card.kanji) {
        const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
        if (stem && stem !== card.kanji && /[\\u4e00-\\u9faf々]/.test(stem) && combinedText.includes(stem)) {
          isMatch = true;
        }
      }
      if (!isMatch && card.forms) {
        for (const form of card.forms) {
          if (form.value && combinedText.includes(form.value)) {
            isMatch = true;
            break;
          }
        }
      }
    }

    if (isMatch) {
      if (!uniqueWords.has(wordStr)) {
        uniqueWords.set(wordStr, card);
      }
    }
  });

  return Array.from(uniqueWords.values());
}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/ConversationView.tsx', content);
