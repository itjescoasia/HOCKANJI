const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr1 = `  const filteredConversations = React.useMemo(() => {
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

const replaceStr1 = `  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const cleanText = (str) => {
      if (!str) return "";
      return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[.,!?;:'"()[\]{}\\\\/_-]/g, " ").replace(/\\s+/g, " ").trim();
    };
    
    const query = cleanText(searchQuery);
    const queryWords = query.split(/\\s+/).filter(Boolean);
    if (queryWords.length === 0) return conversations;

    return conversations.filter(conv => {
      const titleMatch = cleanText(conv.title).includes(query);
      const descMatch = cleanText(conv.description).includes(query);
      if (titleMatch || descMatch) return true;
      
      return conv.dialogues.some(d => {
        const j = cleanText(d.japanese);
        const v = cleanText(d.vietnamese);
        const h = cleanText(d.hiragana);
        const r = cleanText(d.romaji);
        const textToSearch = \`\${j} \${v} \${h} \${r}\`;
        
        // Match if exact phrase
        if (textToSearch.includes(query)) return true;
        
        // Or if most of the words (>= 60%) match
        const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
        return (matchCount / queryWords.length) >= 0.6;
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
                        });`;

const replaceStr2 = `                      {searchQuery.trim() !== "" && (() => {
                        const cleanText = (str) => {
                          if (!str) return "";
                          return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[.,!?;:'"()[\]{}\\\\/_-]/g, " ").replace(/\\s+/g, " ").trim();
                        };
                        const query = cleanText(searchQuery);
                        const queryWords = query.split(/\\s+/).filter(Boolean);
                        if (queryWords.length === 0) return null;
                        
                        const matchedDialogues = conv.dialogues.filter(d => {
                          const j = cleanText(d.japanese);
                          const v = cleanText(d.vietnamese);
                          const h = cleanText(d.hiragana);
                          const r = cleanText(d.romaji);
                          const textToSearch = \`\${j} \${v} \${h} \${r}\`;
                          
                          if (textToSearch.includes(query)) return true;
                          const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
                          return (matchCount / queryWords.length) >= 0.6;
                        });`;

if (content.includes(targetStr2)) {
  content = content.replace(targetStr2, replaceStr2);
  console.log("Updated card level search");
} else {
  console.log("Could not find Target Content 2");
}

fs.writeFileSync('src/components/ConversationView.tsx', content);
