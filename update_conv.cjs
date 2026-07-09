const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf-8');

code = code.replace(
  '{dialogue.hiragana}',
  '<RelatedHighlight text={dialogue.hiragana} type="hiragana" />'
);

code = code.replace(
  '{dialogue.romaji}',
  '<RelatedHighlight text={dialogue.romaji} type="romaji" />'
);

code = code.replace(
  '{conversation.dialogues[currentSlideIndex].hiragana}',
  '<RelatedHighlight text={conversation.dialogues[currentSlideIndex].hiragana} type="hiragana" />'
);

code = code.replace(
  '{conversation.dialogues[currentSlideIndex].romaji}',
  '<RelatedHighlight text={conversation.dialogues[currentSlideIndex].romaji} type="romaji" />'
);

fs.writeFileSync('src/components/ConversationView.tsx', code);
console.log('done conv');
