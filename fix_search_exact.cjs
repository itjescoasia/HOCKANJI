const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr1 = `  const fuse = React.useMemo(
    () =>
      new Fuse(conversations, {
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

const replaceStr1 = `  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() : "";
    const query = removeAccents(searchQuery.trim());
    const queryWords = query.split(/\\s+/);
    
    return conversations.filter(conv => {
      const titleMatch = removeAccents(conv.title).includes(query);
      const descMatch = removeAccents(conv.description).includes(query);
      if (titleMatch || descMatch) return true;
      
      return conv.dialogues.some(d => {
        const j = removeAccents(d.japanese);
        const v = removeAccents(d.vietnamese);
        const h = removeAccents(d.hiragana);
        const r = removeAccents(d.romaji);
        
        const textToSearch = \`\${j} \${v} \${h} \${r}\`;
        return textToSearch.includes(query) || queryWords.every(qw => textToSearch.includes(qw));
      });
    });
  }, [conversations, searchQuery]);`;

if (content.includes(targetStr1)) {
  content = content.replace(targetStr1, replaceStr1);
  console.log("Updated top level search");
} else {
  console.log("Could not find Target Content 1");
}

const targetStr2 = `                      {searchQuery.trim() !== "" && (() => {
                        const dialogueFuse = new Fuse(conv.dialogues, {
                          keys: ["japanese", "vietnamese", "hiragana", "romaji"],
                          threshold: 0.4,
                          ignoreLocation: true,
                        });
                        
                        const matchedDialogues = dialogueFuse.search(searchQuery).map(r => r.item);
                        
                        if (matchedDialogues.length === 0) return null;`;

const replaceStr2 = `                      {searchQuery.trim() !== "" && (() => {
                        const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() : "";
                        const query = removeAccents(searchQuery.trim());
                        const queryWords = query.split(/\\s+/);
                        
                        const matchedDialogues = conv.dialogues.filter(d => {
                          const j = removeAccents(d.japanese);
                          const v = removeAccents(d.vietnamese);
                          const h = removeAccents(d.hiragana);
                          const r = removeAccents(d.romaji);
                          const textToSearch = \`\${j} \${v} \${h} \${r}\`;
                          return textToSearch.includes(query) || queryWords.every(qw => textToSearch.includes(qw));
                        });
                        
                        if (matchedDialogues.length === 0) return null;`;

if (content.includes(targetStr2)) {
  content = content.replace(targetStr2, replaceStr2);
  console.log("Updated card level search");
} else {
  console.log("Could not find Target Content 2");
}

fs.writeFileSync('src/components/ConversationView.tsx', content);
