const fs = require('fs');
let code = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

code = code.replace(
  'import { renderExampleHighlight, tokenizeExampleText, RelatedHighlight, HighlightProvider } from "../utils/highlight";',
  'import { renderExampleHighlight, tokenizeExampleText, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";'
);

code = code.replace(
  '<p className="text-sm text-theme-primary/70 mt-1 italic border-l-2 border-theme-primary/20 pl-2">\n                                      {dialogue.vietnamese}\n                                    </p>',
  '<p className="text-sm text-theme-primary/70 mt-1 italic border-l-2 border-theme-primary/20 pl-2">\n                                      <HighlightVietnamese text={dialogue.vietnamese || ""} />\n                                    </p>'
);

code = code.replace(
  '<p className="text-xl text-theme-primary/70 italic mt-4">\n                    {conversation.dialogues[currentSlideIndex].vietnamese}\n                  </p>',
  '<p className="text-xl text-theme-primary/70 italic mt-4">\n                    <HighlightVietnamese text={conversation.dialogues[currentSlideIndex].vietnamese || ""} />\n                  </p>'
);

fs.writeFileSync('src/components/ConversationView.tsx', code);
