const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

// For the list item
content = content.replace(
  '{dialogue.vietnamese}\n                                    </p>\n                                  )}\n                                </div>\n                              </div>',
  '{dialogue.vietnamese}\n                                    </p>\n                                  )}\n                                </div></HighlightProvider>\n                              </div>'
);

// For the slide
content = content.replace(
  '{conversation.dialogues[currentSlideIndex].vietnamese}\n                  </p>',
  '{conversation.dialogues[currentSlideIndex].vietnamese}\n                  </p></HighlightProvider>'
);

fs.writeFileSync('src/components/ConversationView.tsx', content);
