const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `  const handleConvDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    if (searchQuery.trim() !== "") return;

    const items = Array.from(filteredConversations);`;

const replaceStr = `  const handleConvDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    if (searchQuery.trim() !== "") return;

    const items = Array.from(conversations);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  console.log("Updated DragEnd handler");
} else {
  console.log("Could not find Target Content 2");
}

fs.writeFileSync('src/components/ConversationView.tsx', content);
