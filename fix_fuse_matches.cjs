const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `      new Fuse(conversations, {
        keys: [
          "title", 
          "description",
          "dialogues.japanese",
          "dialogues.vietnamese",
          "dialogues.hiragana",
          "dialogues.romaji"
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [conversations]
  );

  const filteredConversations = searchQuery.trim()
    ? fuse.search(searchQuery).map((r) => r.item)
    : conversations;`;

const replaceStr = `      new Fuse(conversations, {
        keys: [
          "title", 
          "description",
          "dialogues.japanese",
          "dialogues.vietnamese",
          "dialogues.hiragana",
          "dialogues.romaji"
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [conversations]
  );

  // We do not use includeMatches directly from fuse because it doesn't give us the exact dialogue object easily.
  // Let's just manually filter dialogues in the render if there is a search query.
  const filteredConversations = searchQuery.trim()
    ? fuse.search(searchQuery).map((r) => r.item)
    : conversations;`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Updated Fuse matches");
} else {
  console.log("Could not find Target Content");
}
