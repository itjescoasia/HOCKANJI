const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `      new Fuse(conversations, {
        keys: ["title", "description"],
        threshold: 0.4,`;

const replaceStr = `      new Fuse(conversations, {
        keys: [
          "title", 
          "description",
          "dialogues.japanese",
          "dialogues.vietnamese",
          "dialogues.hiragana",
          "dialogues.romaji"
        ],
        threshold: 0.4,`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Updated Fuse search keys");
} else {
  console.log("Could not find Target Content");
}
